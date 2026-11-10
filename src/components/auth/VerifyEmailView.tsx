import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { api } from '../../client/api';
import { UserProfile } from '../../types/auth';
import { sanitizeErrorMessage } from '../../utils/errorUtils';

import { LogoAnimation } from '../branding/LogoAnimation';

interface VerifyEmailViewProps {
  email: string;
  initialToken?: string;
  onVerified: (user: UserProfile) => void;
  onNavigateLogin: () => void;
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({
  email,
  initialToken = '',
  onVerified,
  onNavigateLogin,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [cooldown, setCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mask email for privacy (e.g. s***h@company.com)
  const maskEmail = (raw: string) => {
    if (!raw.includes('@')) return raw;
    const [name, domain] = raw.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // If initial token was passed, auto-verify
  useEffect(() => {
    if (initialToken && initialToken.length > 10) {
      handleVerify(initialToken);
    }
  }, [initialToken]);

  const handleVerify = async (tokToUse?: string) => {
    const tok = tokToUse || tokenInput.trim();
    if (!tok) {
      setError('Please provide the verification code or token.');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      const res = await api.verifyEmail(tok);
      setMessage('Email verified successfully! Establishing session...');
      setTimeout(() => {
        onVerified(res.user);
      }, 1200);
    } catch (err: unknown) {
      setError(sanitizeErrorMessage(err, 'Invalid or expired verification token.'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    try {
      setIsResending(true);
      setError(null);
      const res = await api.resendVerification(email);
      setCooldown(60);
      setMessage(res.message || 'Verification email has been resent.');
      if (res.verificationToken) {
        setTokenInput(res.verificationToken);
      }
    } catch (err: unknown) {
      setError(sanitizeErrorMessage(err, 'Failed to resend verification email. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5 text-xs text-center">
      {/* Animated Geometric Connected-Node Verification Mark */}
      <div className="flex items-center justify-center mx-auto">
        <LogoAnimation size={60} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Verify Your Email</h2>
        <p className="text-gray-500 mt-1 leading-relaxed">
          We dispatched a verification link and security token to{' '}
          <span className="font-semibold text-gray-900 font-mono">{maskEmail(email || 'your email')}</span>.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800 text-left">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2 text-emerald-800 text-left">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Manual Token Confirmation */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left space-y-2">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1">
          <KeyRound className="w-3.5 h-3.5 text-gray-400" />
          <span>Security Verification Token</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste verification token or click verify"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden font-mono text-xs bg-white"
          />
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isVerifying || !tokenInput.trim()}
            className="px-4 py-2 bg-[#187B61] hover:bg-[#16835D] text-white font-bold rounded-lg text-xs disabled:opacity-50 transition-all shrink-0"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400">
          In dev sandbox, your security token is pre-populated for immediate verification.
        </p>
      </div>

      {/* Resend Action */}
      <div className="pt-2 flex flex-col items-center space-y-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-xs font-semibold text-[#187B61] hover:underline disabled:text-gray-400 disabled:no-underline flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>
            {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
          </span>
        </button>

        <button
          type="button"
          onClick={onNavigateLogin}
          className="text-xs text-gray-500 hover:text-gray-900 font-medium flex items-center space-x-1 pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </button>
      </div>
    </div>
  );
};
