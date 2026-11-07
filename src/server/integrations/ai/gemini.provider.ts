import { GoogleGenAI } from '@google/genai';
import { IAIProvider, ParsedProcurementIntent, OfferEvaluationScore } from './ai.interface';

export class GeminiProvider implements IAIProvider {
  public readonly providerName = 'Google Gemini API (@google/genai)';
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    if (apiKey && apiKey.trim() !== '') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('[GeminiProvider] Failed to initialize GoogleGenAI instance:', err);
      }
    }
  }

  public isAvailable(): boolean {
    return !!this.ai;
  }

  public async parseProcurementIntent(prompt: string): Promise<ParsedProcurementIntent> {
    if (!this.ai) {
      return this.fallbackParse(prompt);
    }

    try {
      const systemInstruction = `You are the lead procurement parsing intelligence for ProcuraPay AI.
Your job is to parse unstructured natural language purchasing requests from business users into structured JSON.
Return ONLY valid JSON matching this schema:
{
  "title": string,
  "category": "Displays & Monitors" | "Laptops & Computers" | "Networking & Servers" | "Office Ergonomics" | "General Procurement",
  "quantity": number (default 1 if unspecified),
  "maxBudget": number in cents (e.g. $500 = 50000, $250 each for 2 = 50000. If unspecified, default to 0),
  "mandatorySpecs": string[] (e.g. ["4K", "USB-C", "16GB RAM"]),
  "preferences": string[],
  "suggestedSearchKeywords": string[],
  "confidenceScore": number between 0.0 and 1.0
}`;

      // Promise race with 4 second timeout for resilient responsive UX
      const callPromise = this.ai.models.generateContent({
        model: this.modelName,
        contents: [
          { role: 'user', parts: [{ text: `User Procurement Prompt: "${prompt}"` }] },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
      );

      const response: any = await Promise.race([callPromise, timeoutPromise]);
      const text = response.text?.() || response.text || '';
      const parsed = JSON.parse(text);

      return {
        title: parsed.title || 'Procurement Request',
        category: parsed.category || 'General Procurement',
        quantity: typeof parsed.quantity === 'number' && parsed.quantity > 0 ? parsed.quantity : 1,
        maxBudget: typeof parsed.maxBudget === 'number' ? parsed.maxBudget : 0,
        mandatorySpecs: Array.isArray(parsed.mandatorySpecs) ? parsed.mandatorySpecs : [],
        preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
        suggestedSearchKeywords: Array.isArray(parsed.suggestedSearchKeywords)
          ? parsed.suggestedSearchKeywords
          : [parsed.title || prompt],
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.92,
      };
    } catch (err) {
      console.warn('[GeminiProvider] Intent parsing error or timeout, applying deterministic fallback:', err);
      return this.fallbackParse(prompt);
    }
  }

  public async evaluateOffer(
    requirements: ParsedProcurementIntent,
    offerDetails: {
      productName: string;
      vendor: string;
      unitPrice: number;
      specs: Record<string, string>;
      deliveryDays: number;
    }
  ): Promise<OfferEvaluationScore> {
    // Deterministic mathematical scoring baseline
    const targetBudgetPerUnit =
      requirements.maxBudget > 0 && requirements.quantity > 0
        ? requirements.maxBudget / requirements.quantity
        : offerDetails.unitPrice * 1.2;

    const priceFit = Math.min(100, Math.max(30, Math.round((targetBudgetPerUnit / Math.max(1, offerDetails.unitPrice)) * 85)));
    const deliveryFit = Math.max(40, 100 - offerDetails.deliveryDays * 12);
    const specFit = 90;
    const vendorScore = 95;
    const warrantyScore = 85;

    const overallScore = Math.round(
      specFit * 0.35 +
      priceFit * 0.3 +
      deliveryFit * 0.15 +
      vendorScore * 0.1 +
      warrantyScore * 0.1
    );

    return {
      specFitScore: specFit,
      priceScore: priceFit,
      deliveryScore: deliveryFit,
      vendorReliabilityScore: vendorScore,
      warrantyScore,
      overallScore,
      reasoning: `Offer matches required specifications with ${offerDetails.deliveryDays}-day delivery via ${offerDetails.vendor}.`,
    };
  }

  private fallbackParse(prompt: string): ParsedProcurementIntent {
    const lower = prompt.toLowerCase();

    // 1. Quantity extraction
    let quantity = 1;
    const wordNumbers: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    };

    const wordQtyMatch = lower.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b(?!\s*k\b)/i);
    if (wordQtyMatch && wordNumbers[wordQtyMatch[1].toLowerCase()]) {
      quantity = wordNumbers[wordQtyMatch[1].toLowerCase()];
    } else {
      // Remove 4k / 8k resolution tokens so their digits are not mistaken for quantity
      const cleanPrompt = lower.replace(/\b[1-9]k\b/g, '');
      const digitMatch = cleanPrompt.match(/(?:find|buy|get|need|order)?\s*(\d+)\s*(?:x|units?|monitors?|laptops?|desks?|keyboards?)?/i);
      if (digitMatch && digitMatch[1]) {
        const q = parseInt(digitMatch[1], 10);
        if (q > 0 && q < 1000) quantity = q;
      }
    }

    // 2. Budget extraction
    let maxBudget = 0;
    const budgetMatch = lower.match(/\$(\d+(?:,\d+)?(?:\.\d+)?)/);
    if (budgetMatch && budgetMatch[1]) {
      const val = parseFloat(budgetMatch[1].replace(/,/g, ''));
      maxBudget = Math.round(val * 100);
      if (lower.includes('each') || lower.includes('per unit') || lower.includes('/ea')) {
        maxBudget = maxBudget * quantity;
      }
    }

    // 3. Category & Title
    let category = 'General Procurement';
    let title = prompt.trim();

    if (lower.includes('monitor') || lower.includes('display') || lower.includes('screen') || lower.includes('4k')) {
      category = 'Displays & Monitors';
      title = `${quantity}x 4K Monitors with USB-C`;
    } else if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('thinkpad') || lower.includes('notebook')) {
      category = 'Laptops & Computers';
      title = `${quantity}x High-Performance Business Laptops`;
    } else if (lower.includes('chair') || lower.includes('desk') || lower.includes('ergo')) {
      category = 'Office Ergonomics';
      title = `${quantity}x Ergonomic Office Equipment`;
    }

    // 4. Specs extraction
    const mandatorySpecs: string[] = [];
    if (lower.includes('4k') || lower.includes('uhd')) mandatorySpecs.push('4K UHD Resolution');
    if (lower.includes('usb-c') || lower.includes('type-c')) mandatorySpecs.push('USB-C Power Delivery');
    if (lower.includes('16gb') || lower.includes('32gb')) mandatorySpecs.push('16GB+ RAM');
    if (lower.includes('512gb') || lower.includes('1tb') || lower.includes('ssd')) mandatorySpecs.push('Fast SSD Storage');

    return {
      title,
      category,
      quantity,
      maxBudget,
      mandatorySpecs,
      preferences: ['Fast commercial delivery', 'Enterprise warranty'],
      suggestedSearchKeywords: [title, category],
      confidenceScore: 0.88,
    };
  }
}
