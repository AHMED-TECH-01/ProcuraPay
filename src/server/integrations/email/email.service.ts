import { ResendEmailProvider } from './resend.provider';
import { SandboxEmailProvider } from './sandbox.provider';
import { IEmailProvider, SendEmailResult } from './email.interface';

export class EmailService {
  private static resend = new ResendEmailProvider();
  private static sandbox = new SandboxEmailProvider();

  public static get activeProvider(): IEmailProvider {
    return this.resend.isConfigured() ? this.resend : this.sandbox;
  }

  public static async sendVerificationEmail(
    email: string,
    verificationToken: string,
    fullName: string
  ): Promise<SendEmailResult> {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyLink = `${appUrl}/verify-email?token=${verificationToken}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #FFFFFF;">
        <div style="margin-bottom: 20px;">
          <h2 style="color: #111827; margin: 0; font-size: 20px;">Verify Your Work Email</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">ProcuraPay AI — Autonomous Procurement Platform</p>
        </div>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">Hello ${fullName},</p>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">Thank you for registering your organization with ProcuraPay AI. Please confirm your email address by clicking the button below or entering the verification token:</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${verifyLink}" style="background-color: #187B61; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Verify Email Address</a>
        </div>
        <div style="background-color: #F7F8F6; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #111827; word-break: break-all; margin: 16px 0;">
          <strong>Verification Token:</strong> ${verificationToken}
        </div>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px; border-top: 1px solid #E5E7EB; pt: 16px;">
          If you did not create this account, please disregard this email.
        </p>
      </div>
    `;

    return this.activeProvider.sendEmail({
      to: email,
      subject: 'Verify your ProcuraPay AI work account',
      html,
      text: `Hello ${fullName},\n\nPlease verify your email for ProcuraPay AI: ${verifyLink}\n\nToken: ${verificationToken}`,
    });
  }

  public static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<SendEmailResult> {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #FFFFFF;">
        <h2 style="color: #111827; margin: 0; font-size: 20px;">Password Reset Request</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.5; margin-top: 16px;">We received a request to reset your password for ProcuraPay AI.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #187B61; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
        </div>
        <div style="background-color: #F7F8F6; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #111827; word-break: break-all;">
          <strong>Reset Token:</strong> ${resetToken}
        </div>
      </div>
    `;

    return this.activeProvider.sendEmail({
      to: email,
      subject: 'Reset your ProcuraPay AI password',
      html,
    });
  }
}
