import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { PurchaseRequest, ApprovalRecord } from '../../types';
import { AIAgentService } from '../services/agent.service';
import { PayPalService } from '../services/paypal.service';
import { ProductResearchService, VERIFIED_PRODUCT_CATALOG } from '../services/research.service';
import { DeterministicScoringEngine } from '../services/scoring.service';
import { PolicyService } from '../services/policy.service';

export const apiRouter = Router();

import { AuthService } from '../services/auth.service';

// ==========================================
// 1. AUTH & ORGANIZATION
// ==========================================

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  const { fullName, email, password, companyName } = req.body;
  if (!fullName || !email || !password || !companyName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const result = await AuthService.register({ fullName, email, password, companyName });
    res.status(201).json(result);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/auth/verify-email', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }
  try {
    const user = await AuthService.verifyEmail(token);
    res.json({ message: 'Email successfully verified.', user });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/auth/resend-verification', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  try {
    const result = await AuthService.resendVerification(email);
    res.json({ message: 'Verification email resent.', ...result });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const result = await AuthService.login({ email, password });
    if (!result.isVerified) {
      return res.status(403).json({
        error: 'Email is not verified. Please verify your email before logging in.',
        isVerified: false,
        email,
      });
    }
    res.json(result);
  } catch (err: unknown) {
    res.status(401).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  try {
    const result = await AuthService.forgotPassword(email);
    res.json({ message: 'If an account exists, a password reset link has been dispatched.', ...result });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/auth/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  try {
    await AuthService.resetPassword(token, newPassword);
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.body.token as string);
  if (token) {
    AuthService.logout(token);
  }
  res.json({ message: 'Successfully logged out.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);
  const session = token ? AuthService.getSession(token) : null;

  if (session) {
    return res.json({
      user: session.user,
      organization: db.organization,
      isAuthenticated: true,
    });
  }

  // Fallback to default owner profile
  res.json({
    user: {
      id: 'usr-ahmed-01',
      email: db.organization.ownerEmail,
      fullName: db.organization.ownerName,
      companyName: db.organization.name,
      emailVerified: true,
      role: 'OWNER',
      organizationId: db.organization.id,
      createdAt: db.organization.createdAt,
    },
    organization: db.organization,
    isAuthenticated: false,
  });
});

apiRouter.get('/organizations/current', (_req: Request, res: Response) => {
  res.json({ organization: db.organization });
});

apiRouter.patch('/organizations/current', (req: Request, res: Response) => {
  const { name, currency, plan } = req.body;
  if (name) db.organization.name = name;
  if (currency) db.organization.currency = currency;
  if (plan) db.organization.plan = plan;

  db.addAuditLog({
    organizationId: db.organization.id,
    eventType: 'ORGANIZATION_CREATED',
    severity: 'INFO',
    actor: db.organization.ownerEmail,
    details: { updatedFields: req.body },
  });

  res.json({ organization: db.organization });
});

// ==========================================
// 2. PROCUREMENT REQUESTS
// ==========================================
apiRouter.get('/procurement/requests', (_req: Request, res: Response) => {
  const list = Array.from(db.requests.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ requests: list });
});

apiRouter.get('/procurement/requests/:id', (req: Request, res: Response) => {
  const request = db.requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Purchase request not found' });
  }

  const proposal = request.activeProposalId ? db.proposals.get(request.activeProposalId) : undefined;
  const agentRun = request.agentRunId ? db.agentRuns.get(request.agentRunId) : undefined;

  res.json({ request, proposal, agentRun });
});

apiRouter.post('/procurement/requests', (req: Request, res: Response) => {
  const { rawPrompt, title, category, quantity, maxBudget, currency, mandatorySpecs, preferences } = req.body;

  if (!rawPrompt) {
    return res.status(400).json({ error: 'Natural language purchasing request is required' });
  }

  const id = 'req-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  const newRequest: PurchaseRequest = {
    id,
    organizationId: db.organization.id,
    title: title || rawPrompt.slice(0, 60),
    rawPrompt,
    category: category || 'General Commercial Hardware',
    quantity: quantity && Number(quantity) > 0 ? Number(quantity) : 1,
    maxBudget: maxBudget ? Number(maxBudget) : 0, // cents
    currency: currency || db.organization.currency || 'USD',
    mandatorySpecs: Array.isArray(mandatorySpecs) ? mandatorySpecs : [],
    preferences: Array.isArray(preferences) ? preferences : [],
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  };

  db.requests.set(id, newRequest);

  db.addAuditLog({
    organizationId: db.organization.id,
    eventType: 'PROCUREMENT_CREATED',
    severity: 'INFO',
    actor: db.organization.ownerEmail,
    details: { requestId: id, title: newRequest.title, quantity: newRequest.quantity, maxBudget: newRequest.maxBudget },
  });

  res.status(201).json({ request: newRequest });
});

// Run AI Procurement Agent
apiRouter.post('/procurement/requests/:id/run-agent', async (req: Request, res: Response) => {
  const request = db.requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Purchase request not found' });
  }

  request.status = 'RESEARCHING';
  request.updatedAt = new Date().toISOString();
  db.requests.set(request.id, request);

  try {
    const result = await AIAgentService.executeProcurementAgent(request);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

apiRouter.get('/procurement/requests/:id/agent-runs', (req: Request, res: Response) => {
  const runs = Array.from(db.agentRuns.values()).filter(r => r.requestId === req.params.id);
  res.json({ agentRuns: runs });
});

// ==========================================
// 3. PROPOSALS
// ==========================================
apiRouter.get('/procurement/proposals/:id', (req: Request, res: Response) => {
  const proposal = db.proposals.get(req.params.id);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }
  res.json({ proposal });
});

// ==========================================
// 4. POLICIES
// ==========================================
apiRouter.get('/policies', (_req: Request, res: Response) => {
  res.json({ policy: db.policy });
});

apiRouter.patch('/policies/:id', (req: Request, res: Response) => {
  const { maxPurchaseAmount, approvalRequired, requireApprovalAbove, allowedVendorDomains, blockedCategories } = req.body;

  if (typeof maxPurchaseAmount === 'number') db.policy.maxPurchaseAmount = maxPurchaseAmount;
  if (typeof approvalRequired === 'boolean') db.policy.approvalRequired = approvalRequired;
  if (typeof requireApprovalAbove === 'number') db.policy.requireApprovalAbove = requireApprovalAbove;
  if (Array.isArray(allowedVendorDomains)) db.policy.allowedVendorDomains = allowedVendorDomains;
  if (Array.isArray(blockedCategories)) db.policy.blockedCategories = blockedCategories;

  db.policy.updatedAt = new Date().toISOString();

  db.addAuditLog({
    organizationId: db.organization.id,
    eventType: 'POLICY_EVALUATED',
    severity: 'INFO',
    actor: db.organization.ownerEmail,
    details: { action: 'POLICY_UPDATED', currentLimits: db.policy },
  });

  res.json({ policy: db.policy });
});

// ==========================================
// 5. HUMAN APPROVAL WORKFLOW
// ==========================================
apiRouter.get('/approvals', (_req: Request, res: Response) => {
  const pendingProposals = Array.from(db.proposals.values())
    .filter(p => p.status === 'PENDING_APPROVAL')
    .map(proposal => {
      const request = db.requests.get(proposal.requestId);
      return { proposal, request };
    });

  const history = Array.from(db.approvals.values()).sort(
    (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
  );

  res.json({ pendingProposals, history });
});

apiRouter.post('/approvals/:id/approve', (req: Request, res: Response) => {
  const proposal = db.proposals.get(req.params.id);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  if (proposal.status !== 'PENDING_APPROVAL') {
    return res.status(400).json({ error: `Cannot approve proposal with status ${proposal.status}` });
  }

  // Atomic state transition
  proposal.status = 'APPROVED';
  db.proposals.set(proposal.id, proposal);

  const request = db.requests.get(proposal.requestId);
  if (request) {
    request.status = 'CHECKOUT_READY';
    request.updatedAt = new Date().toISOString();
    db.requests.set(request.id, request);
  }

  const approvalId = 'appr-' + Math.random().toString(36).substring(2, 9);
  const approvalRecord: ApprovalRecord = {
    id: approvalId,
    proposalId: proposal.id,
    requestId: proposal.requestId,
    organizationId: proposal.organizationId,
    decision: 'APPROVED',
    decidedBy: db.organization.ownerEmail,
    proposalSnapshot: {
      amount: proposal.totalAmount,
      currency: proposal.currency,
      version: proposal.version,
      vendor: proposal.selectedOffer.vendor,
      productName: proposal.selectedOffer.productName,
    },
    decidedAt: new Date().toISOString(),
  };
  db.approvals.set(approvalId, approvalRecord);

  db.addAuditLog({
    organizationId: proposal.organizationId,
    eventType: 'APPROVAL_DECISION',
    severity: 'INFO',
    actor: db.organization.ownerEmail,
    details: {
      decision: 'APPROVED',
      proposalId: proposal.id,
      amount: proposal.totalAmount,
      product: proposal.selectedOffer.productName,
      vendor: proposal.selectedOffer.vendor,
    },
  });

  res.json({ approval: approvalRecord, proposal, request });
});

apiRouter.post('/approvals/:id/reject', (req: Request, res: Response) => {
  const proposal = db.proposals.get(req.params.id);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Mandatory rejection reason is required for audit trail' });
  }

  proposal.status = 'REJECTED';
  db.proposals.set(proposal.id, proposal);

  const request = db.requests.get(proposal.requestId);
  if (request) {
    request.status = 'REJECTED';
    request.updatedAt = new Date().toISOString();
    db.requests.set(request.id, request);
  }

  const approvalId = 'appr-' + Math.random().toString(36).substring(2, 9);
  const approvalRecord: ApprovalRecord = {
    id: approvalId,
    proposalId: proposal.id,
    requestId: proposal.requestId,
    organizationId: proposal.organizationId,
    decision: 'REJECTED',
    decidedBy: db.organization.ownerEmail,
    rejectionReason: reason,
    proposalSnapshot: {
      amount: proposal.totalAmount,
      currency: proposal.currency,
      version: proposal.version,
      vendor: proposal.selectedOffer.vendor,
      productName: proposal.selectedOffer.productName,
    },
    decidedAt: new Date().toISOString(),
  };
  db.approvals.set(approvalId, approvalRecord);

  db.addAuditLog({
    organizationId: proposal.organizationId,
    eventType: 'APPROVAL_DECISION',
    severity: 'WARNING',
    actor: db.organization.ownerEmail,
    details: {
      decision: 'REJECTED',
      proposalId: proposal.id,
      amount: proposal.totalAmount,
      reason,
    },
  });

  res.json({ approval: approvalRecord, proposal, request });
});

// ==========================================
// 6. PAYPAL PAYMENTS
// ==========================================
apiRouter.post('/payments/create-order', async (req: Request, res: Response) => {
  const { proposalId } = req.body;
  if (!proposalId) {
    return res.status(400).json({ error: 'proposalId is required' });
  }

  const proposal = db.proposals.get(proposalId);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  try {
    const result = await PayPalService.createOrder({
      proposalId,
      requestId: proposal.requestId,
      actor: db.organization.ownerEmail,
    });
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: errorMsg });
  }
});

apiRouter.post('/payments/capture-order', async (req: Request, res: Response) => {
  const { transactionId, paypalOrderId } = req.body;
  if (!transactionId || !paypalOrderId) {
    return res.status(400).json({ error: 'transactionId and paypalOrderId are required' });
  }

  try {
    const transaction = await PayPalService.captureOrder({
      transactionId,
      paypalOrderId,
      actor: db.organization.ownerEmail,
    });
    res.json({ transaction });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: errorMsg });
  }
});

apiRouter.get('/payments', (_req: Request, res: Response) => {
  const payments = Array.from(db.payments.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ payments });
});

apiRouter.get('/payments/:id', (req: Request, res: Response) => {
  const payment = db.payments.get(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found' });
  }
  const proposal = db.proposals.get(payment.proposalId);
  const request = db.requests.get(payment.requestId);
  res.json({ payment, proposal, request });
});

// Webhook
apiRouter.post('/webhooks/paypal', async (req: Request, res: Response) => {
  try {
    const result = await PayPalService.processWebhookEvent(req.body);
    res.status(200).json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: errorMsg });
  }
});

// ==========================================
// 7. PRODUCT RESEARCH & CATALOG
// ==========================================
apiRouter.get('/products/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || undefined;
  const products = await ProductResearchService.searchProducts(query, category);
  res.json({ products });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = VERIFIED_PRODUCT_CATALOG.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

apiRouter.post('/products/compare', (req: Request, res: Response) => {
  const { products, quantity, maxBudget, mandatorySpecs, preferences } = req.body;
  const evaluated = DeterministicScoringEngine.evaluateOffers(products || VERIFIED_PRODUCT_CATALOG, {
    quantity: Number(quantity) || 1,
    maxBudget: Number(maxBudget) || 0,
    mandatorySpecs: Array.isArray(mandatorySpecs) ? mandatorySpecs : [],
    preferences: Array.isArray(preferences) ? preferences : [],
  });
  res.json({ evaluatedOffers: evaluated });
});

// ==========================================
// 8. ANALYTICS & AUDIT LOGS
// ==========================================
apiRouter.get('/analytics/overview', (_req: Request, res: Response) => {
  const allPayments = Array.from(db.payments.values());
  const completedPayments = allPayments.filter(p => p.status === 'COMPLETED');

  const totalSpendingCents = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  const pendingApprovalsCount = Array.from(db.proposals.values()).filter(
    p => p.status === 'PENDING_APPROVAL'
  ).length;

  const activeRequestsCount = Array.from(db.requests.values()).filter(
    r => r.status === 'RESEARCHING' || r.status === 'PENDING_APPROVAL' || r.status === 'CHECKOUT_READY'
  ).length;

  const completedPurchasesCount = completedPayments.length;

  // Monthly spending breakdown
  const monthlyMap: Record<string, number> = {};
  completedPayments.forEach(p => {
    const month = new Date(p.capturedAt || p.createdAt).toLocaleString('default', { month: 'short' });
    monthlyMap[month] = (monthlyMap[month] || 0) + p.amount / 100;
  });

  // Vendor distribution
  const vendorMap: Record<string, { count: number; totalAmountCents: number }> = {};
  completedPayments.forEach(p => {
    const prop = db.proposals.get(p.proposalId);
    const vendor = prop?.selectedOffer?.vendor || 'Commercial Supplier';
    if (!vendorMap[vendor]) {
      vendorMap[vendor] = { count: 0, totalAmountCents: 0 };
    }
    vendorMap[vendor].count += 1;
    vendorMap[vendor].totalAmountCents += p.amount;
  });

  const vendorDistribution = Object.entries(vendorMap).map(([vendor, data]) => ({
    vendor,
    count: data.count,
    amount: data.totalAmountCents / 100,
  }));

  // Budget utilization % vs max single purchase policy ($4,500 standard)
  const budgetUtilizationPercent = Math.min(
    100,
    Math.round((totalSpendingCents / (db.policy.maxPurchaseAmount * 2)) * 100)
  );

  res.json({
    totalSpendingCents,
    totalSpendingFormatted: `$${(totalSpendingCents / 100).toFixed(2)}`,
    pendingApprovalsCount,
    activeRequestsCount,
    completedPurchasesCount,
    budgetUtilizationPercent,
    monthlySpending: Object.entries(monthlyMap).map(([name, amount]) => ({ name, amount })),
    vendorDistribution,
    recentTransactions: allPayments.slice(0, 5),
  });
});

apiRouter.get('/audit-logs', (_req: Request, res: Response) => {
  res.json({ auditLogs: db.auditLogs });
});

// ==========================================
// 9. AUTONOMOUS EXTERNAL INTEGRATIONS API
// ==========================================
import {
  getIntegrationsStatus,
  currencyProvider,
  invoiceProvider,
  paymentProvider,
  discoveryProvider,
} from '../integrations';

apiRouter.get('/integrations/status', (_req: Request, res: Response) => {
  res.json({
    timestamp: new Date().toISOString(),
    integrations: getIntegrationsStatus(),
  });
});

apiRouter.get('/currency/rates', async (req: Request, res: Response) => {
  try {
    const base = (req.query.base as string) || 'USD';
    const rates = await currencyProvider.getRates(base);
    res.json(rates);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/currency/convert', async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.body;
    if (amount === undefined || !from || !to) {
      return res.status(400).json({ error: 'amount, from, and to currencies are required.' });
    }
    const result = await currencyProvider.convert({
      amount: Number(amount),
      fromCurrency: String(from),
      toCurrency: String(to),
    });
    res.json(result);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/invoices/:transactionId', async (req: Request, res: Response) => {
  const transaction = db.payments.get(req.params.transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }

  const proposal = db.proposals.get(transaction.proposalId);
  if (!proposal) {
    return res.status(404).json({ error: 'Associated proposal not found.' });
  }

  try {
    const invoice = await invoiceProvider.generateInvoice({
      invoiceNumber: `INV-${transaction.transactionReference}`,
      organizationName: db.organization.name,
      billingEmail: db.organization.ownerEmail,
      vendorName: proposal.selectedOffer.vendor,
      vendorUrl: proposal.selectedOffer.vendorUrl,
      items: [
        {
          description: `${proposal.quantity}x ${proposal.selectedOffer.productName}`,
          quantity: proposal.quantity,
          unitPrice: proposal.unitPrice,
          total: proposal.unitPrice * proposal.quantity,
        },
      ],
      subtotal: proposal.subtotal,
      tax: proposal.estimatedTax,
      shipping: proposal.estimatedShipping,
      total: proposal.totalAmount,
      currency: proposal.currency,
      paypalOrderId: transaction.paypalOrderId,
      paypalCaptureId: transaction.paypalCaptureId,
      approverEmail: db.organization.ownerEmail,
      approvedAt: proposal.approvedAt || transaction.createdAt,
      paidAt: transaction.capturedAt || transaction.createdAt,
    });

    if (req.query.format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(invoice.html);
    }

    res.json({ invoice });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
