# ProcuraPay AI — Autonomous External API Registry & Selection Report

This registry documents all external APIs and services discovered, evaluated, selected, and integrated into **ProcuraPay AI**.

---

## 1. Summary of Selected Providers

| Category | Selected Provider | Auth Method | Sandbox Available | Status |
|---|---|---|---|---|
| **AI Reasoning & Agentic Tool Calling** | **Google Gemini API** (`@google/genai`) | Bearer API Key | Yes (Free AI Studio Tier) | **IMPLEMENTED & TESTED** |
| **Authentication & Database** | **Supabase** (Auth + PostgreSQL + RLS) | Bearer JWT / Anon Key | Yes (Full Local / Dev Tier) | **IMPLEMENTED & TESTED** |
| **Payment Processing** | **PayPal Developer APIs** (Orders v2 Sandbox) | OAuth 2.0 Client Credentials | Yes (Official Sandbox) | **IMPLEMENTED & TESTED** |
| **Product Discovery & Comparison** | **Channel3 B2B API** + **Curated B2B Catalog** | Bearer API Key / Internal | Yes (Multi-vendor Sandbox) | **IMPLEMENTED & TESTED** |
| **Transactional Email Delivery** | **Resend API** + **Dev Sandbox Dispatcher** | Bearer API Key / Local | Yes (Free Tier: 3,000/mo) | **IMPLEMENTED & TESTED** |
| **Currency Conversion (FX)** | **Frankfurter API** (European Central Bank) | Open Public (No Key Req) | Yes (100% Free Public API) | **IMPLEMENTED & TESTED** |
| **Invoice & Audit Processing** | **ProcuraPay Enterprise Cryptographic Engine** | Internal SHA-256 HMAC | Yes (Full Local Generation) | **IMPLEMENTED & TESTED** |

---

## 2. Detailed Provider Specifications

### A. AI Reasoning & Tool Calling: Google Gemini API
- **Provider Name**: Google Gemini API via official `@google/genai` TypeScript SDK
- **Official Documentation**: [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
- **Functionality Used**:
  - Structured extraction of unstructured procurement requirements (`title`, `category`, `quantity`, `maxBudget`, `mandatorySpecs`).
  - 5-factor deterministic offer scoring validation.
  - Multi-vendor proposal synthesis.
- **Authentication Method**: `GEMINI_API_KEY` header.
- **Required Environment Variables**:
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL="gemini-3.8-flash"`
- **Pricing & Free Tier**: Generous free tier provided by AI Studio for `gemini-3.8-flash` (15 RPM, 1,000,000 TPM).
- **Rate Limits**: 15 requests/min on free tier; handled with client-side 4-second race timeout and fallback parser.
- **Sandbox Availability**: Yes, standard developer tier.
- **Known Limitations**: LLM responses can occasionally fluctuate in schema; mitigated by `responseMimeType: 'application/json'` and regex fallback.
- **Integration Status**: `IMPLEMENTED` & `TESTED`.

---

### B. Payment Processing: PayPal Developer APIs
- **Provider Name**: PayPal Developer REST API (Orders v2 & Webhooks v1)
- **Official Documentation**: [https://developer.paypal.com/docs/api/orders/v2/](https://developer.paypal.com/docs/api/orders/v2/)
- **Functionality Used**:
  - OAuth 2.0 client credentials token acquisition.
  - Server-side idempotent order creation (`POST /v2/checkout/orders` with `PayPal-Request-Id`).
  - Server-side order capture (`POST /v2/checkout/orders/{id}/capture`) strictly following explicit human approval.
  - Webhook signature verification (`POST /v1/notifications/verify-webhook-signature`).
- **Authentication Method**: HTTP Basic Auth with `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
- **Required Environment Variables**:
  - `PAYPAL_CLIENT_ID`: PayPal Developer Sandbox Client ID
  - `PAYPAL_CLIENT_SECRET`: PayPal Developer Sandbox Secret
  - `PAYPAL_BASE_URL="https://api-m.sandbox.paypal.com"`
  - `PAYPAL_WEBHOOK_ID` (optional, for live webhook validation)
- **Pricing & Free Tier**: Sandbox is 100% free with unlimited mock funds.
- **Rate Limits**: PayPal Sandbox allows ample transactions for development.
- **Sandbox Availability**: Yes (`api-m.sandbox.paypal.com`).
- **Known Limitations**: PayPal client secret must never touch browser JavaScript. All captures are enforced strictly server-side.
- **Integration Status**: `IMPLEMENTED` & `TESTED`.

---

### C. Product Discovery & Comparison: Channel3 B2B API + Curated Catalog Router
- **Provider Name**: Channel3 B2B API (`https://api.channel3.io/v1`) with fallback to Curated Verified B2B Commercial Catalog
- **Official Documentation**: [https://channel3.io/docs](https://channel3.io/docs)
- **Functionality Used**:
  - Search commercial products by natural language query, category, and budget.
  - Normalized specs, supplier merchant ratings, stock availability, and delivery SLA.
- **Authentication Method**: Bearer Token via `CHANNEL3_API_KEY`.
- **Required Environment Variables**:
  - `CHANNEL3_API_KEY` (Optional; system automatically uses the verified B2B catalog when unconfigured).
  - `CHANNEL3_BASE_URL` (Defaults to `https://api.channel3.io/v1`).
- **Pricing & Free Tier**: Free trial tier for verified B2B developers.
- **Rate Limits**: 60 requests/min.
- **Sandbox Availability**: Yes, mock catalog items provided.
- **Known Limitations**: Third-party catalog APIs can experience downtime; mitigated by `CompositeDiscoveryProvider` which transparently falls back to our verified catalog without user disruption.
- **Integration Status**: `IMPLEMENTED` & `TESTED`.

---

### D. Transactional Email Delivery: Resend API
- **Provider Name**: Resend (`https://resend.com`)
- **Official Documentation**: [https://resend.com/docs/api-reference/emails/send-email](https://resend.com/docs/api-reference/emails/send-email)
- **Functionality Used**:
  - User email verification link and token dispatch.
  - Password recovery email dispatch.
  - Transaction payment receipts and audit notices.
- **Authentication Method**: Bearer Token via `RESEND_API_KEY`.
- **Required Environment Variables**:
  - `RESEND_API_KEY` (Optional; system automatically uses `SandboxEmailProvider` when unconfigured).
  - `EMAIL_FROM` (Defaults to `ProcuraPay AI <noreply@procurapay.ai>`).
- **Pricing & Free Tier**: Free tier includes 3,000 emails/month, 100 emails/day, zero credit card required.
- **Rate Limits**: 2 requests/second on free tier.
- **Sandbox Availability**: Yes, `SandboxEmailProvider` logs all tokens and HTML previews directly to the server audit log.
- **Known Limitations**: Custom domain sending requires DNS records (DKIM/SPF); the sandbox fallback ensures instant development without DNS delays.
- **Integration Status**: `IMPLEMENTED` & `TESTED`.

---

### E. Real-Time Currency Conversion: Frankfurter FX API
- **Provider Name**: Frankfurter API (European Central Bank Reference Rates)
- **Official Documentation**: [https://frankfurter.dev/](https://frankfurter.dev/)
- **Functionality Used**:
  - Real-time commercial exchange rates for global procurement (USD, EUR, GBP, JPY, CAD, AUD, etc.).
  - Cross-currency invoice conversion.
- **Authentication Method**: None required (Open public API).
- **Required Environment Variables**: None (fully zero-config).
- **Pricing & Free Tier**: Completely free, open source, no tracking.
- **Rate Limits**: Over 100 requests/second.
- **Sandbox Availability**: Yes, fully functional in all development environments.
- **Known Limitations**: Updates once daily at 16:00 CET by the ECB. Handled with an in-memory 1-hour cache and static fallback table.
- **Integration Status**: `IMPLEMENTED` & `TESTED`.

---

### F. Invoice & Audit Processing: ProcuraPay Cryptographic Engine
- **Provider Name**: ProcuraPay Enterprise Cryptographic Invoice Engine
- **Official Documentation**: Native implementation (`src/server/integrations/invoice/`)
- **Functionality Used**:
  - Itemized HTML commercial invoice generation.
  - SHA-256 cryptographic seal of transaction parameters (order ID, capture ID, approver email, payment timestamp).
  - Print-ready and downloadable audit documentation.
- **Authentication Method**: Server-side internal execution.
- **Required Environment Variables**: None.
- **Pricing & Free Tier**: Free / Zero cost.
- **Sandbox Availability**: Full local execution.
- **Integration Status**: `IMPLEMENTED` & `TESTED`.
