import crypto from 'crypto';
import {
  IPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  CaptureOrderParams,
  CaptureOrderResult,
  WebhookVerificationParams,
} from './payment.interface';

export class PayPalProvider implements IPaymentProvider {
  public readonly providerName = 'PayPal Developer Sandbox (REST API v2)';

  private get baseUrl(): string {
    return process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  }

  private get clientId(): string | undefined {
    return process.env.PAYPAL_CLIENT_ID;
  }

  private get clientSecret(): string | undefined {
    return process.env.PAYPAL_CLIENT_SECRET;
  }

  private get webhookId(): string | undefined {
    return process.env.PAYPAL_WEBHOOK_ID;
  }

  // In-memory token cache
  private cachedToken: { token: string; expiresAt: number } | null = null;

  public isLiveSandboxConfigured(): boolean {
    return !!(
      this.clientId &&
      this.clientSecret &&
      this.clientId.trim() !== '' &&
      this.clientSecret.trim() !== '' &&
      !this.clientId.includes('MY_PAYPAL')
    );
  }

  /**
   * Acquire official PayPal OAuth 2.0 Access Token
   */
  private async getAccessToken(): Promise<string> {
    if (!this.isLiveSandboxConfigured()) {
      throw new Error('PayPal Sandbox credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured.');
    }

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PayPal OAuth authentication failed: ${err}`);
    }

    const data = await response.json();
    this.cachedToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000,
    };

    return data.access_token;
  }

  /**
   * Create an idempotent PayPal order
   */
  public async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const isLive = this.isLiveSandboxConfigured();
    const idempotencyKey = params.idempotencyKey || `req-order-${params.proposalId}-${Date.now()}`;

    if (isLive) {
      const token = await this.getAccessToken();
      const totalDecimal = (params.amount / 100).toFixed(2);
      const unitDecimal = (params.amount / params.quantity / 100).toFixed(2);

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.proposalId,
            description: `ProcuraPay AI: ${params.quantity}x ${params.productName}`,
            custom_id: params.proposalId,
            amount: {
              currency_code: params.currency,
              value: totalDecimal,
              breakdown: {
                item_total: { currency_code: params.currency, value: totalDecimal },
              },
            },
            items: [
              {
                name: params.productName.substring(0, 127),
                description: `Supplier: ${params.vendor}`.substring(0, 127),
                unit_amount: { currency_code: params.currency, value: unitDecimal },
                quantity: params.quantity.toString(),
                category: 'PHYSICAL_GOODS',
              },
            ],
          },
        ],
        application_context: {
          brand_name: 'ProcuraPay AI Enterprise',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        },
      };

      const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`PayPal Order Creation failed (${res.status}): ${errText}`);
      }

      const orderData = await res.json();
      const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

      return {
        orderId: orderData.id,
        status: orderData.status,
        approvalUrl: approveLink,
        isSandbox: true,
        provider: 'PAYPAL_LIVE_SANDBOX',
        rawResponse: orderData,
      };
    }

    // Emulated Sandbox Order for local dev
    const orderId = 'SANDBOX-ORD-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    return {
      orderId,
      status: 'CREATED',
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
      isSandbox: true,
      provider: 'PAYPAL_SANDBOX_EMULATED',
    };
  }

  /**
   * Capture an approved PayPal order on the server
   */
  public async captureOrder(params: CaptureOrderParams): Promise<CaptureOrderResult> {
    const isLive = this.isLiveSandboxConfigured();
    const idempotencyKey = params.idempotencyKey || `req-capture-${params.orderId}`;

    if (isLive) {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${params.orderId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': idempotencyKey,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`PayPal Capture failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const captureUnit = data.purchase_units?.[0]?.payments?.captures?.[0];
      const capturedAmount = captureUnit?.amount?.value ? Math.round(parseFloat(captureUnit.amount.value) * 100) : 0;

      return {
        captureId: captureUnit?.id || `CAP-${crypto.randomBytes(6).toString('hex')}`,
        orderId: data.id,
        status: data.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        amountCaptured: capturedAmount,
        currency: captureUnit?.amount?.currency_code || 'USD',
        payerEmail: data.payer?.email_address,
        capturedAt: captureUnit?.create_time || new Date().toISOString(),
        provider: 'PAYPAL_LIVE_SANDBOX',
      };
    }

    // Emulated Sandbox Capture
    const captureId = 'CAP-SANDBOX-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    return {
      captureId,
      orderId: params.orderId,
      status: 'COMPLETED',
      amountCaptured: 0, // Will be populated from transaction context
      currency: 'USD',
      payerEmail: params.actor,
      capturedAt: new Date().toISOString(),
      provider: 'PAYPAL_SANDBOX_EMULATED',
    };
  }

  /**
   * Verify Webhook Signature via PayPal REST API
   */
  public async verifyWebhookSignature(params: WebhookVerificationParams): Promise<boolean> {
    if (!this.isLiveSandboxConfigured() || !this.webhookId) {
      // In emulated sandbox, accept webhook if transmissionId is present
      return !!params.transmissionId;
    }

    try {
      const token = await this.getAccessToken();
      const payload = {
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: params.webhookId || this.webhookId,
        webhook_event: JSON.parse(params.eventBody),
      };

      const res = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return false;
      const data = await res.json();
      return data.verification_status === 'SUCCESS';
    } catch (err) {
      console.error('[PayPalProvider] Webhook verification error:', err);
      return false;
    }
  }
}
