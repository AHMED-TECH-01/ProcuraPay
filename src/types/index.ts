export type Currency = 'USD' | 'EUR' | 'GBP';

export type RequestStatus =
  | 'DRAFT'
  | 'RESEARCHING'
  | 'PROPOSED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHECKOUT_READY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface PurchaseRequest {
  id: string;
  organizationId: string;
  title: string;
  rawPrompt: string;
  category: string;
  quantity: number;
  maxBudget: number; // in cents (integer minor units)
  currency: Currency;
  mandatorySpecs: string[];
  preferences: string[];
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  agentRunId?: string;
  activeProposalId?: string;
}

export interface SpecificationMatch {
  spec: string;
  met: boolean;
  notes?: string;
}

export interface ProductOffer {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  productUrl: string;
  vendor: string;
  vendorUrl: string;
  unitPrice: number; // cents
  currency: Currency;
  availability: 'in_stock' | 'limited' | 'backorder';
  deliveryDays: number;
  deliveryEstimate: string;
  vendorReliabilityScore: number; // 0 - 100
  specifications: Record<string, string>;
  specMatches: SpecificationMatch[];
  isEligible: boolean; // passed all mandatory hard filters
  disqualificationReason?: string;
  scores: {
    priceScore: number;       // 35%
    specsScore: number;       // 30%
    vendorScore: number;      // 20%
    deliveryScore: number;    // 10%
    availabilityScore: number;// 5%
    totalScore: number;       // 0 - 100 weighted
  };
  aiExplanation?: string;
}

export interface PurchaseProposal {
  id: string;
  requestId: string;
  organizationId: string;
  selectedOffer: ProductOffer;
  alternativeOffers: ProductOffer[];
  quantity: number;
  unitPrice: number; // cents
  subtotal: number;  // cents
  estimatedTax: number; // cents
  estimatedShipping: number; // cents
  totalAmount: number; // cents
  currency: Currency;
  recommendationReasoning: string;
  savingsCalculated: number; // cents saved vs highest or budget
  policyValidation: PolicyValidationResult;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  version: number;
  approvedAt?: string;
  createdAt: string;
  expiresAt: string;
}

export interface SpendingPolicy {
  id: string;
  organizationId: string;
  currency: Currency;
  maxPurchaseAmount: number; // cents, e.g. 500000 = $5,000.00
  approvalRequired: boolean;
  requireApprovalAbove: number; // cents, e.g. 0 = always requires approval
  allowedVendorDomains: string[];
  blockedCategories: string[];
  updatedAt: string;
}

export interface PolicyValidationResult {
  passed: boolean;
  requiresApproval: boolean;
  violations: string[];
  warnings: string[];
  checkedAt: string;
}

export interface ApprovalRecord {
  id: string;
  proposalId: string;
  requestId: string;
  organizationId: string;
  decision: 'APPROVED' | 'REJECTED';
  decidedBy: string;
  rejectionReason?: string;
  proposalSnapshot: {
    amount: number;
    currency: Currency;
    version: number;
    vendor: string;
    productName: string;
  };
  decidedAt: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'ORDER_CREATED'
  | 'BUYER_APPROVED'
  | 'CAPTURE_REQUESTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RECONCILED';

export interface PaymentTransaction {
  id: string;
  transactionReference: string;
  organizationId: string;
  requestId: string;
  proposalId: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  amount: number; // cents
  currency: Currency;
  status: PaymentStatus;
  payerEmail?: string;
  merchantId?: string;
  paymentMode: 'PAYPAL_SANDBOX_LIVE' | 'PAYPAL_SANDBOX_EMULATED';
  createdAt: string;
  updatedAt: string;
  capturedAt?: string;
  notes?: string;
}

export interface AgentExecutionStep {
  id: string;
  stepName: string;
  toolCalled?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  inputSummary?: string;
  outputSummary?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  durationMs?: number;
}

export interface AgentRun {
  id: string;
  requestId: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  steps: AgentExecutionStep[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  eventType:
    | 'USER_LOGIN'
    | 'ORGANIZATION_CREATED'
    | 'PROCUREMENT_CREATED'
    | 'AGENT_RUN_STARTED'
    | 'AGENT_TOOL_EXECUTED'
    | 'PROPOSAL_GENERATED'
    | 'POLICY_EVALUATED'
    | 'APPROVAL_DECISION'
    | 'PAYPAL_ORDER_CREATED'
    | 'PAYPAL_PAYMENT_CAPTURED'
    | 'WEBHOOK_PROCESSED'
    | 'PAYMENT_FAILURE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  actor: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface Organization {
  id: string;
  name: string;
  currency: Currency;
  ownerEmail: string;
  ownerName: string;
  plan: 'GROWTH' | 'ENTERPRISE';
  createdAt: string;
}
