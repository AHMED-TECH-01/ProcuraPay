import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../client/api';
import { sanitizeErrorMessage } from '../../utils/errorUtils';

interface ForgotPasswordFormProps {
  onNavigateLogin: () => void;
  onHasResetToken?: (token: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onNavigateLogin,
  onHasResetToken,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: unknown) {
      setError(sanitizeErrorMessage(err, 'Failed to request password reset. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {submitted ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#187B61] border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Check Your Inbox</h3>
            <p className="text-gray-500 mt-1 leading-relaxed">
              If an account is associated with <span className="font-semibold text-gray-900">{email}</span>, we have sent a secure password reset link.
            </p>
          </div>

          {/* Dev sandbox token helper */}
          {resetToken && onHasResetToken && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left space-y-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">
                Sandbox Test Mode Detected
              </span>
              <p className="text-[11px] text-gray-600">
                You can immediately proceed to test resetting your password with the generated token:
              </p>
              <button
                type="button"
                onClick={() => onHasResetToken(resetToken)}
                className="w-full py-1.5 bg-[#187B61] text-white font-bold rounded-md hover:bg-[#16835D]"
              >
                Proceed to Reset Password Form
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs font-semibold text-[#187B61] hover:underline flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Registered Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@acme-corp.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden text-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#187B61] hover:bg-[#16835D] text-white font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2 mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Dispatching Reset Link...</span>
              </>
            ) : (
              <span>Send Password Recovery Link</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs text-gray-500 hover:text-gray-900 font-semibold flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel and Return to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
