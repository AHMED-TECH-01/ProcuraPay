import { IEmailProvider, SendEmailParams, SendEmailResult } from './email.interface';

export class ResendEmailProvider implements IEmailProvider {
  public readonly providerName = 'Resend Transactional Email API';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
  }

  public isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('MY_RESEND'));
  }

  public async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      throw new Error('Resend API key is not configured.');
    }

    const fromAddress = params.from || process.env.EMAIL_FROM || 'ProcuraPay AI <noreply@procurapay.ai>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
        tags: params.tags,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend API delivery failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      provider: 'RESEND_LIVE_API',
      delivered: true,
      timestamp: new Date().toISOString(),
    };
  }
}
