import {
  Organization,
  SpendingPolicy,
  PurchaseRequest,
  PurchaseProposal,
  ApprovalRecord,
  PaymentTransaction,
  AgentRun,
  AuditLogEntry,
} from '../../types';

export class ProcuraDatabase {
  private static instance: ProcuraDatabase;

  public organization: Organization = {
    id: 'org-techflow-01',
    name: 'TechFlow Global Logistics',
    currency: 'USD',
    ownerEmail: 'muhammadahmedrazartx@gmail.com',
    ownerName: 'Ahmed Raza',
    plan: 'ENTERPRISE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };

  public policy: SpendingPolicy = {
    id: 'pol-01',
    organizationId: 'org-techflow-01',
    currency: 'USD',
    maxPurchaseAmount: 450000, // $4,500.00
    approvalRequired: true,
    requireApprovalAbove: 0,   // All purchases require explicit approval
    allowedVendorDomains: ['dell.com', 'bhphotovideo.com', 'cdw.com', 'newegg.com', 'amazon.com', 'lenovo.com', 'bestbuy.com'],
    blockedCategories: ['Gambling', 'Luxury Jewelry', 'Cryptocurrency'],
    updatedAt: new Date().toISOString(),
  };

  public requests: Map<string, PurchaseRequest> = new Map();
  public proposals: Map<string, PurchaseProposal> = new Map();
  public approvals: Map<string, ApprovalRecord> = new Map();
  public payments: Map<string, PaymentTransaction> = new Map();
  public agentRuns: Map<string, AgentRun> = new Map();
  public auditLogs: AuditLogEntry[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): ProcuraDatabase {
    if (!ProcuraDatabase.instance) {
      ProcuraDatabase.instance = new ProcuraDatabase();
    }
    return ProcuraDatabase.instance;
  }

  private seedInitialData() {
    // Audit log for organization initialization
    this.addAuditLog({
      organizationId: this.organization.id,
      eventType: 'ORGANIZATION_CREATED',
      severity: 'INFO',
      actor: this.organization.ownerEmail,
      details: {
        orgName: this.organization.name,
        currency: this.organization.currency,
        plan: this.organization.plan,
      },
    });

    // Seed completed past purchase to populate real analytics
    const pastReqId = 'req-seed-past-01';
    const pastPropId = 'prop-seed-past-01';
    const pastPaymentId = 'pay-seed-past-01';

    const pastRequest: PurchaseRequest = {
      id: pastReqId,
      organizationId: this.organization.id,
      title: 'Ergonomic Standing Desks for Engineering Team',
      rawPrompt: 'Order 3 dual-motor motorized standing desks with bamboo tops, width at least 55 inches, under $1,400 total.',
      category: 'Office Furniture',
      quantity: 3,
      maxBudget: 140000,
      currency: 'USD',
      mandatorySpecs: ['Dual motor electric lift', 'Bamboo desktop', '55 inch minimum width'],
      preferences: ['Cable management tray included', 'Memory presets'],
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      activeProposalId: pastPropId,
    };
    this.requests.set(pastReqId, pastRequest);

    const pastPayment: PaymentTransaction = {
      id: pastPaymentId,
      transactionReference: 'TXN-908234-DESK',
      organizationId: this.organization.id,
      requestId: pastReqId,
      proposalId: pastPropId,
      paypalOrderId: '9XX834920K458291A',
      paypalCaptureId: '4CP2948192039485L',
      amount: 119700, // $1,197.00
      currency: 'USD',
      status: 'COMPLETED',
      payerEmail: this.organization.ownerEmail,
      paymentMode: 'PAYPAL_SANDBOX_LIVE',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      capturedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      notes: 'Fully verified PayPal sandbox payment capture. Verified by webhook.',
    };
    this.payments.set(pastPaymentId, pastPayment);

    this.addAuditLog({
      organizationId: this.organization.id,
      eventType: 'PAYPAL_PAYMENT_CAPTURED',
      severity: 'INFO',
      actor: 'PayPal Webhook / Backend Reconciliation',
      details: {
        transactionReference: pastPayment.transactionReference,
        amount: pastPayment.amount,
        paypalCaptureId: pastPayment.paypalCaptureId,
      },
      timestamp: new Date(Date.now() - 12 * 86400000).toISOString(),
    });
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }) {
    const id = 'aud-' + Math.random().toString(36).substring(2, 9);
    const newEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp: entry.timestamp || new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
  }
}

export const db = ProcuraDatabase.getInstance();
