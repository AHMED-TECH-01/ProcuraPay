import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Bot,
  SlidersHorizontal,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  Receipt,
  FileText,
  UserCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { GlassNavigation } from '../ui/GlassNavigation';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Reveal } from '../effects/Reveal';
import { HeroScene } from '../3d/HeroScene';
import { ProcuraLogo } from '../branding/ProcuraLogo';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onNavigateDashboard: () => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateSignup,
  onNavigateDashboard,
  isAuthenticated,
}) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#111827] flex flex-col font-sans selection:bg-[#187B61]/20 selection:text-[#187B61] relative">
      {/* ======================================================== */}
      {/* 1. LIQUID GLASS NAVIGATION BAR                           */}
      {/* ======================================================== */}
      <GlassNavigation
        onNavigateLogin={onNavigateLogin}
        onNavigateSignup={onNavigateSignup}
        onNavigateDashboard={onNavigateDashboard}
        isAuthenticated={isAuthenticated}
      />

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Two-Column Layout + 3D Procurement Core) */}
      {/* ======================================================== */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-[#E5E7EB] bg-gradient-to-b from-[#F7F8F6] via-white to-[#F7F8F6]">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Core Value & Positioning */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <Reveal direction="down" delay={0.1}>
                <div className="inline-flex items-center space-x-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#187B61] bg-[#187B61]/10 border border-[#187B61]/20 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>AI-POWERED PROCUREMENT PLATFORM</span>
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#111827] leading-[1.08] text-balance">
                  Procurement Moves Faster When Intelligence Does.
                </h1>
              </Reveal>

              <Reveal direction="up" delay={0.3}>
                <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl font-normal">
                  Research smarter. Compare better. Approve with confidence. ProcuraPay AI transforms business purchasing into an intelligent, transparent workflow.
                </p>
              </Reveal>

              {/* CTAs */}
              <Reveal direction="up" delay={0.4}>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={onNavigateSignup}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="lg"
                    onClick={() => scrollToSection('product')}
                  >
                    Explore Platform
                  </GlassButton>
                </div>
              </Reveal>

              {/* Trust statement & verification badges */}
              <Reveal direction="up" delay={0.5}>
                <div className="pt-4 border-t border-gray-200/80 space-y-3">
                  <p className="text-xs font-semibold text-gray-800 tracking-wide">
                    Intelligent decisions. Human-controlled payments.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#64748B]">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16835D]" />
                      <span>Deterministic spending policies</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16835D]" />
                      <span>1-Click human payment approval</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Signature 3D Procurement Core Experience */}
            <div className="lg:col-span-6 relative">
              <Reveal direction="left" delay={0.25} className="relative">
                {/* 3D WebGL Canvas */}
                <HeroScene />

                {/* Carefully Positioned Liquid Glass Illustrative Overlay Cards */}
                {/* Overlay 1: Product Research Completed (Top Left) */}
                <div className="absolute top-4 left-2 sm:-left-3 glass-surface p-3 sm:p-3.5 rounded-xl shadow-lg border border-white/80 max-w-[210px] sm:max-w-[230px] animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none select-none">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#187B61]/15 text-[#187B61] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#187B61] tracking-wider">
                      Research Complete
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                    Dell UltraSharp 4K USB-C
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 flex justify-between">
                    <span>2 units</span>
                    <span className="font-mono font-bold text-gray-800">$496.00</span>
                  </div>
                  <div className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block font-medium">
                    Illustrative Preview
                  </div>
                </div>

                {/* Overlay 2: 3 Offers Compared (Top Right) */}
                <div className="absolute top-8 right-2 sm:-right-3 glass-surface p-3 sm:p-3.5 rounded-xl shadow-lg border border-white/80 max-w-[200px] sm:max-w-[220px] animate-in fade-in slide-in-from-right-4 duration-500 delay-150 pointer-events-none select-none">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-700 tracking-wider">
                      3 Offers Ranked
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                    CDW $248 vs Amazon $265
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Best commercial price verified
                  </div>
                  <div className="text-[9px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded mt-1.5 inline-block font-medium">
                    Illustrative Preview
                  </div>
                </div>

                {/* Overlay 3: Policy Check Passed (Bottom Left) */}
                <div className="absolute bottom-14 left-2 sm:-left-2 glass-surface p-3 sm:p-3.5 rounded-xl shadow-lg border border-white/80 max-w-[210px] sm:max-w-[230px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 pointer-events-none select-none">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider">
                      Policy Passed
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                    Under $1,000 threshold
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Approved supplier domain verified
                  </div>
                  <div className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block font-medium">
                    Illustrative Preview
                  </div>
                </div>

                {/* Overlay 4: Awaiting Human Approval (Bottom Right) */}
                <div className="absolute bottom-6 right-2 sm:right-2 glass-panel p-3 sm:p-3.5 rounded-xl shadow-xl border border-emerald-500/20 max-w-[220px] sm:max-w-[240px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-450 pointer-events-none select-none">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#187B61] text-white flex items-center justify-center">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#187B61] tracking-wider">
                      Human Authority
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                    Awaiting Business Sign-off
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5">
                    1-Click encrypted PayPal capture
                  </div>
                  <div className="text-[9px] text-emerald-900 bg-emerald-100/90 px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold">
                    Human Authorization Required
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CORE BENEFITS (3 Pillars in Liquid Glass Bento)        */}
      {/* ======================================================== */}
      <section id="product" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#187B61] bg-[#187B61]/10 px-3 py-1 rounded-full">
              Intelligent Financial Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
              Complete Procurement Automation. Zero Loss of Control.
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Businesses lose thousands to disjointed purchasing, hidden supplier markups, and rogue spend. ProcuraPay AI establishes continuous clarity.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Benefit 1: Intelligent Research */}
          <Reveal direction="up" delay={0.1}>
            <GlassCard variant="default" className="space-y-4 h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#187B61]/20 to-[#10B981]/10 text-[#187B61] flex items-center justify-center border border-[#187B61]/20 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Intelligent Research</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Describe purchasing requirements in natural language. Our autonomous agent retrieves live product specifications, stock levels, and commercial quotes across certified suppliers.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#187B61] flex items-center space-x-1">
                <span>Autonomous query parsing</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </GlassCard>
          </Reveal>

          {/* Benefit 2: Policy-Aware Decisions */}
          <Reveal direction="up" delay={0.2}>
            <GlassCard variant="default" className="space-y-4 h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shadow-xs">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Policy-Aware Decisions</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Every offer is evaluated against predefined business purchasing policies. Hard spending ceilings, supplier domain whitelists, and blocked categories are mathematically guarded.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-700 flex items-center space-x-1">
                <span>Deterministic rules engine</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </GlassCard>
          </Reveal>

          {/* Benefit 3: Human-Controlled Payments */}
          <Reveal direction="up" delay={0.3}>
            <GlassCard variant="accent" className="space-y-4 h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#187B61]/25 to-teal-500/15 text-[#187B61] flex items-center justify-center border border-[#187B61]/30 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Human-Controlled Payments</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Financial transactions require explicit human authorization before execution. AI generates actionable proposals, but never holds discretionary spending keys or unattended checkout authority.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#187B61] flex items-center space-x-1">
                <span>Immutable human gate</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS (5-Step Sequential Workflow Timeline)    */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <Reveal direction="up">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#187B61] bg-[#187B61]/10 px-3 py-1 rounded-full">
                5-Step Engineered Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mt-3">
                From Conversational Request to Verified Settlement
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                A transparent, step-by-step pipeline connecting natural business intent with enterprise financial control.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <Reveal direction="up" delay={0.1}>
              <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col justify-between space-y-3 bg-[#F7F8F6]/80">
                <div>
                  <span className="text-xs font-mono font-bold text-[#187B61] px-2 py-0.5 rounded bg-[#187B61]/10 inline-block mb-2">
                    01
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">Describe Requirements</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Provide natural prompt: "Procure two ergonomic 4K monitors under $250 with fast delivery."
                  </p>
                </div>
                <div className="text-[10px] font-mono text-gray-400 border-t border-gray-200/60 pt-2">
                  NLP Parameter Extraction
                </div>
              </div>
            </Reveal>

            {/* Step 2 */}
            <Reveal direction="up" delay={0.2}>
              <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col justify-between space-y-3 bg-[#F7F8F6]/80">
                <div>
                  <span className="text-xs font-mono font-bold text-[#187B61] px-2 py-0.5 rounded bg-[#187B61]/10 inline-block mb-2">
                    02
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">AI Supplier Research</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Autonomous agent queries certified B2B supplier catalogs, tests stock, and compiles quotes.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-gray-400 border-t border-gray-200/60 pt-2">
                  Gemini Flash + Search
                </div>
              </div>
            </Reveal>

            {/* Step 3 */}
            <Reveal direction="up" delay={0.3}>
              <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col justify-between space-y-3 bg-[#F7F8F6]/80">
                <div>
                  <span className="text-xs font-mono font-bold text-[#187B61] px-2 py-0.5 rounded bg-[#187B61]/10 inline-block mb-2">
                    03
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">Compare & Score</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Applies 5-factor deterministic evaluation and filters out any non-compliant vendor offerings.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-gray-400 border-t border-gray-200/60 pt-2">
                  Deterministic Policy Checks
                </div>
              </div>
            </Reveal>

            {/* Step 4 */}
            <Reveal direction="up" delay={0.4}>
              <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col justify-between space-y-3 bg-emerald-50/40 border-emerald-300/40">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 inline-block mb-2">
                    04
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">Review & Approve</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Authorized decision-maker reviews savings, compliance report, and grants explicit approval.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-emerald-700 font-bold border-t border-emerald-200/60 pt-2">
                  Human Authority Gate
                </div>
              </div>
            </Reveal>

            {/* Step 5 */}
            <Reveal direction="up" delay={0.5}>
              <div className="liquid-glass-card p-5 rounded-2xl h-full flex flex-col justify-between space-y-3 bg-[#0070BA]/5 border-[#0070BA]/20">
                <div>
                  <span className="text-xs font-mono font-bold text-[#0070BA] px-2 py-0.5 rounded bg-[#0070BA]/10 inline-block mb-2">
                    05
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">Complete Payment</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Server initializes order, captures PayPal transaction securely, and updates audit records.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#0070BA] font-bold border-t border-blue-200/60 pt-2">
                  Encrypted Settlement
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECURITY SECTION (Automation with Accountability)     */}
      {/* ======================================================== */}
      <section id="security" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Reveal direction="down">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#187B61] bg-[#187B61]/10 px-3 py-1 rounded-full">
                Security & Governance
              </span>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                Automation with Accountability.
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.2}>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                We treat procurement and payment processing as mission-critical enterprise infrastructure. Every operational boundary is enforced at the server and database level.
              </p>
            </Reveal>

            <div className="space-y-3 pt-2 text-xs">
              <Reveal direction="up" delay={0.3}>
                <div className="glass-surface p-4 rounded-xl flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#187B61]/15 text-[#187B61] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Organization-Level Data Isolation</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed">
                      Multi-tenant Row Level Security (RLS) ensures that companies and purchasing departments only access their own authorized records and transaction logs.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.4}>
                <div className="glass-surface p-4 rounded-xl flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#187B61]/15 text-[#187B61] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Policy-Based Purchasing Controls</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed">
                      Predefined corporate thresholds, category constraints, and authorized supplier domains are evaluated before any proposal is delivered for sign-off.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.5}>
                <div className="glass-surface p-4 rounded-xl flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#187B61]/15 text-[#187B61] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Tamper-Resistant Transaction Audit Trails</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed">
                      Every prompt, AI tool execution, policy score, human authorization timestamp, and PayPal capture receipt is immutably indexed.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right Column: Visual Vault Architecture */}
          <div className="lg:col-span-6">
            <Reveal direction="left" delay={0.25}>
              <div className="relative liquid-glass-card p-3 rounded-3xl overflow-hidden shadow-xl bg-white/95">
                <img
                  src="/src/assets/images/fintech_security_vault_1793975754645.jpg"
                  alt="Enterprise Security Architecture"
                  className="rounded-2xl w-full h-[380px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 glass-panel p-3.5 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-gray-900">Server Authorization Active</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-500">Zero Unattended Payments</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FINAL CALL TO ACTION (Liquid Glass Box)               */}
      {/* ======================================================== */}
      <section id="about" className="py-20 md:py-28 bg-[#F7F8F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="glass-panel rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden border border-[#187B61]/25 shadow-xl">
              {/* Background Emerald Ambient Radiance */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-[#187B61] bg-[#187B61]/10 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Generation Autonomous Procurement</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
                  Make Your Next Purchase Smarter.
                </h2>

                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl mx-auto">
                  Bring intelligence, transparency, and financial control to your business procurement process.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={onNavigateSignup}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Get Started
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="lg"
                    onClick={onNavigateLogin}
                  >
                    Sign In
                  </GlassButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. ENTERPRISE FOOTER                                     */}
      {/* ======================================================== */}
      <footer className="bg-white border-t border-[#E5E7EB] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            {/* Brand column */}
            <div className="space-y-3 max-w-xs">
              <ProcuraLogo
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="md"
              />
              <p className="text-xs text-[#64748B] leading-relaxed">
                Autonomous Procurement. Human-Controlled Payments. Enterprise AI-powered purchasing intelligence SaaS.
              </p>
            </div>

            {/* Nav Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs text-[#64748B]">
              <div className="space-y-2.5">
                <span className="font-bold text-gray-900 block uppercase tracking-wider text-[11px]">
                  Product
                </span>
                <button
                  onClick={() => scrollToSection('product')}
                  className="block hover:text-[#187B61] transition-colors cursor-pointer text-left"
                >
                  Intelligent Research
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="block hover:text-[#187B61] transition-colors cursor-pointer text-left"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('security')}
                  className="block hover:text-[#187B61] transition-colors cursor-pointer text-left"
                >
                  Security & Policies
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="font-bold text-gray-900 block uppercase tracking-wider text-[11px]">
                  Company
                </span>
                <button
                  onClick={() => scrollToSection('about')}
                  className="block hover:text-[#187B61] transition-colors cursor-pointer text-left"
                >
                  About ProcuraPay
                </button>
                <span className="block hover:text-gray-900 cursor-pointer">
                  Supplier Directory
                </span>
                <span className="block hover:text-gray-900 cursor-pointer">
                  Enterprise SLA
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="font-bold text-gray-900 block uppercase tracking-wider text-[11px]">
                  Authentication
                </span>
                <button
                  onClick={onNavigateLogin}
                  className="block hover:text-[#187B61] transition-colors cursor-pointer text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={onNavigateSignup}
                  className="block hover:text-[#187B61] transition-colors cursor-pointer text-left"
                >
                  Get Started
                </button>
                {isAuthenticated && (
                  <button
                    onClick={onNavigateDashboard}
                    className="block text-[#187B61] font-semibold hover:underline cursor-pointer text-left"
                  >
                    Go to Workspace
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-4">
            <span>© {new Date().getFullYear()} ProcuraPay AI Inc. All rights reserved.</span>
            <div className="flex space-x-4">
              <span className="hover:text-gray-900 cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-gray-900 cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:text-gray-900 cursor-pointer">Security Practices</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
