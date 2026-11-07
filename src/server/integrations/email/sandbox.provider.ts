import crypto from 'crypto';
import { IEmailProvider, SendEmailParams, SendEmailResult } from './email.interface';

export class SandboxEmailProvider implements IEmailProvider {
  public readonly providerName = 'ProcuraPay Development Sandbox Email Dispatcher';

  public isConfigured(): boolean {
    return true;
  }

  public async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    const id = 'sim-email-' + crypto.randomBytes(8).toString('hex');
    const to = Array.isArray(params.to) ? params.to.join(', ') : params.to;

    console.log(`\n======================================================`);
    console.log(`[EMAIL SANDBOX] To: ${to}`);
    console.log(`[EMAIL SANDBOX] Subject: ${params.subject}`);
    console.log(`[EMAIL SANDBOX] Timestamp: ${new Date().toISOString()}`);
    console.log(`======================================================\n`);

    return {
      id,
      provider: 'DEV_SANDBOX_DISPATCHER',
      delivered: true,
      timestamp: new Date().toISOString(),
    };
  }
}
