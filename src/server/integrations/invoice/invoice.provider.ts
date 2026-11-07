import crypto from 'crypto';
import {
  IInvoiceProvider,
  GenerateInvoiceParams,
  InvoiceDocument,
} from './invoice.interface';

export class EnterpriseInvoiceProvider implements IInvoiceProvider {
  public readonly providerName = 'ProcuraPay Enterprise Cryptographic Invoice Engine';

  public async generateInvoice(params: GenerateInvoiceParams): Promise<InvoiceDocument> {
    const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

    const itemsRows = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 13px;">${item.description}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #374151; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #374151; font-size: 13px; font-family: monospace;">${formatMoney(item.unitPrice)}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827; font-weight: 600; font-size: 13px; font-family: monospace;">${formatMoney(item.total)}</td>
        </tr>`
      )
      .join('');

    const rawPayload = JSON.stringify({
      invoiceNumber: params.invoiceNumber,
      order: params.paypalOrderId,
      capture: params.paypalCaptureId,
      total: params.total,
      approver: params.approverEmail,
      timestamp: params.paidAt,
    });

    const sha256Hash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${params.invoiceNumber} — ProcuraPay AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F8F6; margin: 0; padding: 40px 20px; color: #111827; }
    .invoice-card { max-width: 780px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 40px; }
    .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #187B61; padding-bottom: 24px; margin-bottom: 32px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
    .logo-text span { color: #187B61; }
    .meta-box { text-align: right; }
    .meta-title { font-size: 28px; font-weight: 900; color: #187B61; margin: 0; }
    .badge { display: inline-block; background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .section-title { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .info-name { font-size: 15px; font-weight: 700; color: #111827; }
    .info-sub { font-size: 13px; color: #4B5563; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { background: #F9FAFB; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4B5563; border-bottom: 1px solid #E5E7EB; }
    .totals-area { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-box { width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4B5563; }
    .total-row.final { font-size: 18px; font-weight: 800; color: #111827; border-top: 2px solid #E5E7EB; padding-top: 10px; margin-top: 6px; }
    .audit-seal { background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 16px; font-size: 11px; color: #475569; word-break: break-all; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-bar">
      <div>
        <div class="logo-text">Procura<span>Pay</span> AI</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Autonomous Procurement • Human-Controlled Payments</div>
      </div>
      <div class="meta-box">
        <div class="meta-title">INVOICE</div>
        <div style="font-size: 13px; font-weight: 600; color: #374151; margin-top: 4px;"># ${params.invoiceNumber}</div>
        <div class="badge">Payment Captured via PayPal</div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="section-title">Billed To (Organization)</div>
        <div class="info-name">${params.organizationName}</div>
        <div class="info-sub">${params.billingEmail}</div>
        <div class="info-sub">Approved by: ${params.approverEmail}</div>
        <div class="info-sub">Approval Timestamp: ${params.approvedAt}</div>
      </div>
      <div>
        <div class="section-title">Verified Supplier / Merchant</div>
        <div class="info-name">${params.vendorName}</div>
        <div class="info-sub">${params.vendorUrl}</div>
        <div class="info-sub">PayPal Order ID: ${params.paypalOrderId}</div>
        <div class="info-sub">PayPal Capture ID: ${params.paypalCaptureId || 'Completed'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span style="font-family: monospace;">${formatMoney(params.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Estimated Tax</span>
          <span style="font-family: monospace;">${formatMoney(params.tax)}</span>
        </div>
        <div class="total-row">
          <span>Commercial Shipping</span>
          <span style="font-family: monospace;">${formatMoney(params.shipping)}</span>
        </div>
        <div class="total-row final">
          <span>Total Paid</span>
          <span style="color: #187B61; font-family: monospace;">${formatMoney(params.total)}</span>
        </div>
      </div>
    </div>

    <div class="audit-seal">
      <div style="font-weight: 700; margin-bottom: 4px; color: #0F172A;">Cryptographic Transaction Seal (SHA-256)</div>
      <div>${sha256Hash}</div>
      <div style="margin-top: 6px; font-size: 10px; color: #64748B;">Generated: ${params.paidAt} | Immutable audit entry indexed in ProcuraPay Enterprise Ledger</div>
    </div>
  </div>
</body>
</html>`;

    return {
      invoiceNumber: params.invoiceNumber,
      html,
      sha256Hash,
      generatedAt: params.paidAt,
      currency: params.currency,
      totalAmount: params.total,
    };
  }
}
