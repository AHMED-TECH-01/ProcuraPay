import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { ProcuraLogo } from '../branding/ProcuraLogo';
import { GlassObject } from '../3d/GlassObject';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNavigateHome: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col justify-between p-4 sm:p-6 md:p-8 selection:bg-[#187B61]/20 selection:text-[#187B61]">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to ProcuraPay Home</span>
        </button>

        <ProcuraLogo onClick={onNavigateHome} size="sm" />
      </div>

      {/* Center Auth Card with Subtle Liquid Glass & 3D Accent */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="liquid-glass-card rounded-2xl p-8 sm:p-10 relative overflow-hidden bg-white/95">
          {/* Subtle Top 3D Accent Token */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{subtitle}</p>
            </div>
            <GlassObject size={44} className="shrink-0 ml-3" />
          </div>
          {children}
        </div>

        {/* Security badge below card */}
        <div className="mt-6 text-center text-[11px] text-[#64748B] flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#187B61]" />
          <span>End-to-End Enterprise Auth with Organization Data Isolation</span>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-[#64748B]">
        © {new Date().getFullYear()} ProcuraPay AI Inc. All rights reserved.
      </div>
    </div>
  );
};
