export interface CreateOrderParams {
  proposalId: string;
  requestId: string;
  amount: number; // in cents
  currency: string;
  productName: string;
  vendor: string;
  quantity: number;
  actor: string;
  idempotencyKey?: string;
}

export interface PaymentOrderResult {
  orderId: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  approvalUrl?: string;
  isSandbox: boolean;
  provider: 'PAYPAL_LIVE_SANDBOX' | 'PAYPAL_SANDBOX_EMULATED';
  rawResponse?: unknown;
}

export interface CaptureOrderParams {
  orderId: string;
  transactionId: string;
  actor: string;
  idempotencyKey?: string;
}

export interface CaptureOrderResult {
  captureId: string;
  orderId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'DECLINED';
  amountCaptured: number; // in cents
  currency: string;
  payerEmail?: string;
  capturedAt: string;
  provider: string;
}

export interface WebhookEventPayload {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: any;
}

export interface WebhookVerificationParams {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  eventBody: string;
}

export interface IPaymentProvider {
  readonly providerName: string;
  isLiveSandboxConfigured(): boolean;
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  captureOrder(params: CaptureOrderParams): Promise<CaptureOrderResult>;
  verifyWebhookSignature(params: WebhookVerificationParams): Promise<boolean>;
}
