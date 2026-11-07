export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  id: string;
  provider: string;
  delivered: boolean;
  timestamp: string;
}

export interface IEmailProvider {
  readonly providerName: string;
  isConfigured(): boolean;
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
}
