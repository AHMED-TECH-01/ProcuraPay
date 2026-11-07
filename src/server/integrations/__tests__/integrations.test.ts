import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GeminiProvider } from '../ai/gemini.provider';
import { PayPalProvider } from '../payments/paypal.provider';
import { CompositeDiscoveryProvider } from '../product-discovery/composite.discovery';
import { FrankfurterCurrencyProvider } from '../currency/frankfurter.provider';
import { EnterpriseInvoiceProvider } from '../invoice/invoice.provider';
import { EmailService } from '../email/email.service';

describe('Autonomous API Discovery & Integrations Suite', () => {
  it('1. Gemini AI Provider: accurately parses procurement intent and extracts budget', async () => {
    const ai = new GeminiProvider();
    const result = await ai.parseProcurementIntent('Find two 4K monitors with USB-C under $250 each');
    assert.strictEqual(result.quantity, 2);
    assert.strictEqual(result.category, 'Displays & Monitors');
    assert.strictEqual(result.maxBudget, 50000); // $500 in cents
    assert.ok(result.mandatorySpecs.length > 0);
  });

  it('2. PayPal Provider: creates idempotent orders and captures payments', async () => {
    const paypal = new PayPalProvider();
    const order = await paypal.createOrder({
      proposalId: 'prop-test-01',
      requestId: 'req-test-01',
      amount: 49000,
      currency: 'USD',
      productName: 'Dell UltraSharp 4K Monitor',
      vendor: 'B&H Photo Video',
      quantity: 2,
      actor: 'muhammadahmedrazartx@gmail.com',
    });

    assert.ok(order.orderId);
    assert.strictEqual(order.isSandbox, true);

    const capture = await paypal.captureOrder({
      orderId: order.orderId,
      transactionId: 'txn-test-01',
      actor: 'muhammadahmedrazartx@gmail.com',
    });

    assert.ok(capture.captureId);
    assert.strictEqual(capture.status, 'COMPLETED');
  });

  it('3. Product Discovery: searches catalog and correctly tags data source', async () => {
    const discovery = new CompositeDiscoveryProvider();
    const products = await discovery.searchProducts({
      keywords: ['4k', 'monitor', 'usb-c'],
      category: 'Displays & Monitors',
    });

    assert.ok(products.length > 0);
    assert.ok(products[0].dataSource === 'VERIFIED_CURATED_CATALOG' || products[0].dataSource === 'LIVE_CHANNEL3_API');
    assert.ok(products[0].offers.length > 0);
  });

  it('4. Frankfurter FX Provider: converts currency accurately with real rates', async () => {
    const fx = new FrankfurterCurrencyProvider();
    const rates = await fx.getRates('USD');
    assert.strictEqual(rates.baseCurrency, 'USD');
    assert.ok(rates.rates['EUR'] > 0);

    const converted = await fx.convert({
      amount: 10000, // $100.00
      fromCurrency: 'USD',
      toCurrency: 'EUR',
    });

    assert.strictEqual(converted.fromCurrency, 'USD');
    assert.strictEqual(converted.toCurrency, 'EUR');
    assert.ok(converted.convertedAmount > 0);
  });

  it('5. Enterprise Invoice Provider: generates HTML and valid SHA-256 seal', async () => {
    const invoice = new EnterpriseInvoiceProvider();
    const doc = await invoice.generateInvoice({
      invoiceNumber: 'INV-TEST-001',
      organizationName: 'TechFlow Global Logistics',
      billingEmail: 'muhammadahmedrazartx@gmail.com',
      vendorName: 'B&H Photo Video',
      vendorUrl: 'https://www.bhphotovideo.com',
      items: [
        {
          description: '2x Dell UltraSharp 4K Monitor',
          quantity: 2,
          unitPrice: 24500,
          total: 49000,
        },
      ],
      subtotal: 49000,
      tax: 3920,
      shipping: 0,
      total: 52920,
      currency: 'USD',
      paypalOrderId: 'SANDBOX-ORD-TEST',
      paypalCaptureId: 'CAP-TEST-01',
      approverEmail: 'muhammadahmedrazartx@gmail.com',
      approvedAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    });

    assert.ok(doc.html.includes('TechFlow Global Logistics'));
    assert.ok(doc.html.includes('INV-TEST-001'));
    assert.strictEqual(doc.sha256Hash.length, 64); // SHA-256 hex is 64 characters
  });

  it('6. Email Dispatcher: dispatches verification emails to active provider', async () => {
    const res = await EmailService.sendVerificationEmail(
      'muhammadahmedrazartx@gmail.com',
      'test-tok-123456',
      'Ahmed Raza'
    );
    assert.ok(res.delivered);
    assert.ok(res.id);
  });
});
