import { GeminiProvider } from './ai/gemini.provider';
import { PayPalProvider } from './payments/paypal.provider';
import { CompositeDiscoveryProvider } from './product-discovery/composite.discovery';
import { EmailService } from './email/email.service';
import { FrankfurterCurrencyProvider } from './currency/frankfurter.provider';
import { EnterpriseInvoiceProvider } from './invoice/invoice.provider';

export const aiProvider = new GeminiProvider();
export const paymentProvider = new PayPalProvider();
export const discoveryProvider = new CompositeDiscoveryProvider();
export const currencyProvider = new FrankfurterCurrencyProvider();
export const invoiceProvider = new EnterpriseInvoiceProvider();

export function getIntegrationsStatus() {
  return [
    {
      name: 'Google Gemini API (@google/genai)',
      category: 'AI Reasoning & NLP',
      isConfigured: aiProvider.isAvailable(),
      status: 'IMPLEMENTED',
      authMethod: 'API Key (GEMINI_API_KEY)',
      sandboxAvailable: true,
      mode: aiProvider.isAvailable() ? 'LIVE_MODEL' : 'DETERMINISTIC_FALLBACK',
    },
    {
      name: 'Supabase Authentication & PostgreSQL',
      category: 'Auth & Data Persistence',
      isConfigured: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      status: 'IMPLEMENTED',
      authMethod: 'Bearer Token / RLS',
      sandboxAvailable: true,
      mode: 'HYBRID_SECURE_AUTH',
    },
    {
      name: 'PayPal Developer Sandbox (REST API v2)',
      category: 'Payment Processing',
      isConfigured: paymentProvider.isLiveSandboxConfigured(),
      status: 'IMPLEMENTED',
      authMethod: 'OAuth 2.0 (PAYPAL_CLIENT_ID & SECRET)',
      sandboxAvailable: true,
      mode: paymentProvider.isLiveSandboxConfigured()
        ? 'PAYPAL_LIVE_SANDBOX'
        : 'PAYPAL_SANDBOX_EMULATED',
    },
    {
      name: 'Channel3 B2B Product Discovery API',
      category: 'Product Research',
      isConfigured: discoveryProvider.isLiveConfigured(),
      status: 'IMPLEMENTED',
      authMethod: 'Bearer Token (CHANNEL3_API_KEY)',
      sandboxAvailable: true,
      mode: discoveryProvider.isLiveConfigured()
        ? 'LIVE_CHANNEL3_API'
        : 'VERIFIED_CURATED_CATALOG',
    },
    {
      name: 'Resend Transactional Email API',
      category: 'Email Delivery',
      isConfigured: EmailService.activeProvider.isConfigured(),
      status: 'IMPLEMENTED',
      authMethod: 'Bearer Token (RESEND_API_KEY)',
      sandboxAvailable: true,
      mode: process.env.RESEND_API_KEY ? 'LIVE_RESEND_API' : 'DEV_SANDBOX_DISPATCHER',
    },
    {
      name: 'Frankfurter FX (European Central Bank)',
      category: 'Foreign Exchange & Currency',
      isConfigured: true,
      status: 'IMPLEMENTED',
      authMethod: 'Open Public API (Zero-Key)',
      sandboxAvailable: true,
      mode: 'LIVE_PUBLIC_API',
    },
    {
      name: 'ProcuraPay Enterprise Invoicing Engine',
      category: 'Audit & Invoice Generation',
      isConfigured: true,
      status: 'IMPLEMENTED',
      authMethod: 'Server SHA-256 HMAC',
      sandboxAvailable: true,
      mode: 'CRYPTOGRAPHIC_ENGINE',
    },
  ];
}
