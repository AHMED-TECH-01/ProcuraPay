export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // cents
  total: number; // cents
}

export interface GenerateInvoiceParams {
  invoiceNumber: string;
  organizationName: string;
  billingEmail: string;
  vendorName: string;
  vendorUrl: string;
  items: InvoiceLineItem[];
  subtotal: number; // cents
  tax: number; // cents
  shipping: number; // cents
  total: number; // cents
  currency: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  approverEmail: string;
  approvedAt: string;
  paidAt: string;
}

export interface InvoiceDocument {
  invoiceNumber: string;
  html: string;
  sha256Hash: string;
  generatedAt: string;
  currency: string;
  totalAmount: number;
}

export interface IInvoiceProvider {
  readonly providerName: string;
  generateInvoice(params: GenerateInvoiceParams): Promise<InvoiceDocument>;
}
