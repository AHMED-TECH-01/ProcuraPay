import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import {
  PurchaseRequest,
  PurchaseProposal,
  AgentRun,
  AgentExecutionStep,
  ProductOffer,
  PolicyValidationResult,
} from '../../types';
import { db } from '../db/database';
import { ProductResearchService } from './research.service';
import { DeterministicScoringEngine } from './scoring.service';
import { PolicyService } from './policy.service';

// Tool Input Schemas validated by Zod
export const ParsePurchaseRequestSchema = z.object({
  title: z.string(),
  itemDescription: z.string(),
  quantity: z.number().int().positive(),
  maxBudget: z.number().int().nonnegative(),
  category: z.string(),
  mandatorySpecs: z.array(z.string()),
  preferences: z.array(z.string()),
});

export const SearchProductsSchema = z.object({
  query: z.string(),
  category: z.string().optional(),
});

export const CompareOffersSchema = z.object({
  quantity: z.number().int().positive(),
  maxBudget: z.number().int().nonnegative(),
  mandatorySpecs: z.array(z.string()),
  preferences: z.array(z.string()),
});

export const CheckPolicySchema = z.object({
  totalAmount: z.number().int().positive(),
  category: z.string(),
  vendor: z.string(),
});

export const CreateProposalSchema = z.object({
  selectedOfferId: z.string(),
  recommendationReasoning: z.string(),
  estimatedTax: z.number().int().nonnegative(),
  estimatedShipping: z.number().int().nonnegative(),
});

export class AIAgentService {
  private static getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * Run the full multi-step agent pipeline with real tool calls and execution telemetry.
   */
  public static async executeProcurementAgent(request: PurchaseRequest): Promise<{
    agentRun: AgentRun;
    proposal?: PurchaseProposal;
  }> {
    const runId = 'run-' + Math.random().toString(36).substring(2, 9);
    const steps: AgentExecutionStep[] = [];
    const startedAt = new Date().toISOString();

    const agentRun: AgentRun = {
      id: runId,
      requestId: request.id,
      status: 'IN_PROGRESS',
      steps,
      startedAt,
    };
    db.agentRuns.set(runId, agentRun);

    // Audit log
    db.addAuditLog({
      organizationId: request.organizationId,
      eventType: 'AGENT_RUN_STARTED',
      severity: 'INFO',
      actor: 'ProcuraPay AI Agent (gemini-3.8-flash)',
      details: { requestId: request.id, runId, rawPrompt: request.rawPrompt },
    });

    const addStep = (
      stepName: string,
      toolCalled: string,
      status: 'RUNNING' | 'COMPLETED' | 'FAILED',
      inputSummary?: string,
      outputSummary?: string,
      details?: Record<string, unknown>,
      durationMs?: number
    ): AgentExecutionStep => {
      const step: AgentExecutionStep = {
        id: 'step-' + Math.random().toString(36).substring(2, 9),
        stepName,
        toolCalled,
        status,
        inputSummary,
        outputSummary,
        details,
        timestamp: new Date().toISOString(),
        durationMs,
      };
      steps.push(step);
      return step;
    };

    try {
      // STEP 1: Understand purchase request & Extract structured requirements
      const step1Start = Date.now();
      addStep(
        'Understanding Natural-Language Request',
        'parse_purchase_request',
        'RUNNING',
        `Prompt: "${request.rawPrompt}"`
      );

      let parsedRequirements = {
        title: request.title,
        quantity: request.quantity,
        maxBudget: request.maxBudget,
        category: request.category,
        mandatorySpecs: request.mandatorySpecs,
        preferences: request.preferences,
      };

      const gemini = this.getGeminiClient();
      if (gemini) {
        try {
          const parsePrompt = `Analyze the natural-language procurement request: "${request.rawPrompt}".
Extract structured JSON matching:
{
  "title": "short concise title",
  "category": "product category",
  "quantity": number,
  "maxBudget": integer cents (e.g. $4000 is 400000, $250 each for 2 is 50000),
  "mandatorySpecs": ["spec1", "spec2"],
  "preferences": ["pref1", "pref2"]
}`;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
          );

          const aiPromise = gemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: parsePrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  maxBudget: { type: Type.INTEGER },
                  mandatorySpecs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  preferences: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'category', 'quantity', 'maxBudget', 'mandatorySpecs', 'preferences'],
              },
            },
          });

          const aiResponse = await Promise.race([aiPromise, timeoutPromise]);

          if (aiResponse && aiResponse.text) {
            const rawParsed = JSON.parse(aiResponse.text);
            const validated = ParsePurchaseRequestSchema.parse({
              ...rawParsed,
              itemDescription: request.rawPrompt,
            });
            parsedRequirements = {
              title: validated.title || request.title,
              quantity: validated.quantity > 0 ? validated.quantity : request.quantity,
              maxBudget: validated.maxBudget > 0 ? validated.maxBudget : request.maxBudget,
              category: validated.category || request.category,
              mandatorySpecs: validated.mandatorySpecs.length > 0 ? validated.mandatorySpecs : request.mandatorySpecs,
              preferences: validated.preferences.length > 0 ? validated.preferences : request.preferences,
            };
          }
        } catch (geminiErr) {
          console.warn('Gemini NLP extraction fallback to deterministic parser:', geminiErr);
        }
      }

      // Update current step to completed
      steps[steps.length - 1].status = 'COMPLETED';
      steps[steps.length - 1].outputSummary = `Identified: ${parsedRequirements.quantity}x ${parsedRequirements.category}. Budget: $${(parsedRequirements.maxBudget / 100).toFixed(2)}. Mandatory specs: [${parsedRequirements.mandatorySpecs.join(', ')}]`;
      steps[steps.length - 1].durationMs = Date.now() - step1Start;

      // STEP 2: Tool Calling - search_products
      const step2Start = Date.now();
      addStep(
        'Executing Multi-Supplier Product Search',
        'search_products',
        'RUNNING',
        `Querying verified supplier databases for: "${parsedRequirements.title} ${parsedRequirements.category}"`
      );

      const catalogMatches = await ProductResearchService.searchProducts(
        `${parsedRequirements.title} ${request.rawPrompt}`,
        parsedRequirements.category
      );

      steps[steps.length - 1].status = 'COMPLETED';
      steps[steps.length - 1].outputSummary = `Discovered ${catalogMatches.length} candidate hardware models across Dell Direct, B&H Photo, CDW, Lenovo, and Amazon Business.`;
      steps[steps.length - 1].durationMs = Date.now() - step2Start;

      // STEP 3: Tool Calling - compare_offers (Deterministic Scoring & Hard Filtering)
      const step3Start = Date.now();
      addStep(
        'Evaluating Specifications & Deterministic Multi-Criteria Scoring',
        'compare_offers',
        'RUNNING',
        `Evaluating against hard filters: [${parsedRequirements.mandatorySpecs.join(', ')}]. Scoring: Price 35%, Specs 30%, Vendor 20%, Delivery 10%, Availability 5%`
      );

      const evaluatedOffers = DeterministicScoringEngine.evaluateOffers(catalogMatches, {
        quantity: parsedRequirements.quantity,
        maxBudget: parsedRequirements.maxBudget,
        mandatorySpecs: parsedRequirements.mandatorySpecs,
        preferences: parsedRequirements.preferences,
      });

      const eligibleOffers = evaluatedOffers.filter(o => o.isEligible);
      const disqualifiedOffers = evaluatedOffers.filter(o => !o.isEligible);

      steps[steps.length - 1].status = 'COMPLETED';
      steps[steps.length - 1].outputSummary = `Compared ${evaluatedOffers.length} total offers. ${eligibleOffers.length} passed all mandatory hard filters; ${disqualifiedOffers.length} disqualified. Top score: ${eligibleOffers[0]?.scores.totalScore || 0}/100.`;
      steps[steps.length - 1].details = {
        topOffer: eligibleOffers[0]?.productName,
        topVendor: eligibleOffers[0]?.vendor,
        unitPrice: eligibleOffers[0]?.unitPrice,
      };
      steps[steps.length - 1].durationMs = Date.now() - step3Start;

      if (eligibleOffers.length === 0) {
        throw new Error('No supplier offers passed mandatory specifications and budget ceiling.');
      }

      const selectedOffer = eligibleOffers[0];
      const alternativeOffers = eligibleOffers.slice(1, 4);

      // STEP 4: Tool Calling - calculate_budget
      const step4Start = Date.now();
      const subtotal = selectedOffer.unitPrice * parsedRequirements.quantity;
      const estimatedTax = Math.round(subtotal * 0.0825); // 8.25% standard sales tax
      const estimatedShipping = selectedOffer.deliveryDays <= 2 ? 0 : 2500; // Free for fast priority
      const totalAmount = subtotal + estimatedTax + estimatedShipping;

      addStep(
        'Calculating Final Financial Amounts',
        'calculate_budget',
        'COMPLETED',
        `Unit: $${(selectedOffer.unitPrice / 100).toFixed(2)} x ${parsedRequirements.quantity} units`,
        `Subtotal: $${(subtotal / 100).toFixed(2)} | Tax: $${(estimatedTax / 100).toFixed(2)} | Shipping: $${(estimatedShipping / 100).toFixed(2)} | Total: $${(totalAmount / 100).toFixed(2)}`,
        { subtotal, estimatedTax, estimatedShipping, totalAmount },
        Date.now() - step4Start
      );

      // STEP 5: Tool Calling - check_purchase_policy
      const step5Start = Date.now();
      addStep(
        'Evaluating Deterministic Spending Policies',
        'check_purchase_policy',
        'RUNNING',
        `Checking amount $${(totalAmount / 100).toFixed(2)} against org limit $${(db.policy.maxPurchaseAmount / 100).toFixed(2)} and approved vendor list.`
      );

      const policyValidation = PolicyService.validatePolicy(db.policy, {
        totalAmount,
        category: selectedOffer.category,
        vendor: selectedOffer.vendor,
        vendorUrl: selectedOffer.vendorUrl,
        selectedOffer,
      });

      steps[steps.length - 1].status = 'COMPLETED';
      steps[steps.length - 1].outputSummary = policyValidation.passed
        ? `Policy compliance PASSED. Human approval required: ${policyValidation.requiresApproval ? 'YES (per governance rules)' : 'NO'}.`
        : `Policy VIOLATION: ${policyValidation.violations.join('; ')}`;
      steps[steps.length - 1].details = {
        passed: policyValidation.passed,
        requiresApproval: policyValidation.requiresApproval,
        violations: policyValidation.violations,
        warnings: policyValidation.warnings,
      };
      steps[steps.length - 1].durationMs = Date.now() - step5Start;

      if (!policyValidation.passed) {
        throw new Error(`Spending Policy Violation: ${policyValidation.violations.join('; ')}`);
      }

      // STEP 6: Tool Calling - create_purchase_proposal
      const step6Start = Date.now();
      addStep(
        'Generating Verified Purchase Proposal',
        'create_purchase_proposal',
        'RUNNING',
        `Binding immutable proposal snapshot for ${selectedOffer.productName}`
      );

      // Calculate real savings vs highest eligible or budget
      const highestPriceOffer = Math.max(...eligibleOffers.map(o => o.unitPrice * parsedRequirements.quantity), parsedRequirements.maxBudget);
      const savingsCalculated = Math.max(0, highestPriceOffer - totalAmount);

      const proposalId = 'prop-' + Math.random().toString(36).substring(2, 9);
      const recommendationReasoning = `ProcuraPay AI evaluated ${evaluatedOffers.length} vendor offers across commercial suppliers. "${selectedOffer.productName}" from ${selectedOffer.vendor} achieved the highest aggregate score (${selectedOffer.scores.totalScore}/100) by satisfying 100% of mandatory specifications [${parsedRequirements.mandatorySpecs.join(', ')}], providing proven enterprise reliability (${selectedOffer.vendorReliabilityScore}%), and offering the optimal balance of immediate delivery (${selectedOffer.deliveryEstimate}) and budget conservation. Unit cost is $${(selectedOffer.unitPrice / 100).toFixed(2)}, saving $${(savingsCalculated / 100).toFixed(2)} against maximum budget.`;

      const proposal: PurchaseProposal = {
        id: proposalId,
        requestId: request.id,
        organizationId: request.organizationId,
        selectedOffer,
        alternativeOffers,
        quantity: parsedRequirements.quantity,
        unitPrice: selectedOffer.unitPrice,
        subtotal,
        estimatedTax,
        estimatedShipping,
        totalAmount,
        currency: request.currency,
        recommendationReasoning,
        savingsCalculated,
        policyValidation,
        status: 'PENDING_APPROVAL',
        version: 1,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(), // 48h expiration
      };

      db.proposals.set(proposalId, proposal);

      steps[steps.length - 1].status = 'COMPLETED';
      steps[steps.length - 1].outputSummary = `Proposal #${proposalId} generated with immutable amount $${(totalAmount / 100).toFixed(2)}. Calculated savings: $${(savingsCalculated / 100).toFixed(2)}.`;
      steps[steps.length - 1].durationMs = Date.now() - step6Start;

      // STEP 7: Tool Calling - request_human_approval
      const step7Start = Date.now();
      addStep(
        'Requesting Human-In-The-Loop Financial Authorization',
        'request_human_approval',
        'COMPLETED',
        `Forwarding proposal #${proposalId} to Organization Owner (${db.organization.ownerEmail})`,
        `Autonomous agent execution paused. Awaiting human owner authorization. AI direct payment capture authority is strictly prohibited.`,
        { proposalId, totalAmount },
        Date.now() - step7Start
      );

      // Update Request status and proposal reference
      request.status = 'PENDING_APPROVAL';
      request.activeProposalId = proposalId;
      request.agentRunId = runId;
      request.updatedAt = new Date().toISOString();
      db.requests.set(request.id, request);

      agentRun.status = 'COMPLETED';
      agentRun.completedAt = new Date().toISOString();
      db.agentRuns.set(runId, agentRun);

      db.addAuditLog({
        organizationId: request.organizationId,
        eventType: 'PROPOSAL_GENERATED',
        severity: 'INFO',
        actor: 'ProcuraPay AI Agent',
        details: {
          proposalId,
          requestId: request.id,
          totalAmount,
          vendor: selectedOffer.vendor,
          product: selectedOffer.productName,
        },
      });

      return { agentRun, proposal };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      agentRun.status = 'FAILED';
      agentRun.error = errorMsg;
      agentRun.completedAt = new Date().toISOString();
      db.agentRuns.set(runId, agentRun);

      request.status = 'FAILED';
      request.updatedAt = new Date().toISOString();
      db.requests.set(request.id, request);

      db.addAuditLog({
        organizationId: request.organizationId,
        eventType: 'AGENT_TOOL_EXECUTED',
        severity: 'WARNING',
        actor: 'ProcuraPay AI Agent',
        details: { runId, error: errorMsg },
      });

      return { agentRun };
    }
  }
}
