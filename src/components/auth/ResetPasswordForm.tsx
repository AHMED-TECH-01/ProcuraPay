import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../../client/api';
import { sanitizeErrorMessage } from '../../utils/errorUtils';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
  onNavigateLogin,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await api.resetPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError(sanitizeErrorMessage(err, 'Failed to reset password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-4 text-xs">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#187B61] border border-emerald-100">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Password Updated</h3>
        <p className="text-gray-500">
          Your new password has been securely stored. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* New Password */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden text-xs"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength meter */}
        {newPassword && (
          <div className="mt-1.5 space-y-1">
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`flex-1 rounded-full ${
                    strength >= level ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 block">
              {strength <= 1 && 'Weak password'}
              {strength === 2 && 'Fair password'}
              {strength >= 3 && 'Strong password'}
            </span>
          </div>
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] outline-hidden text-xs"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-[#187B61] hover:bg-[#16835D] text-white font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 text-xs flex items-center justify-center space-x-2 mt-4"
      >
        {isLoading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <span>Set New Password</span>
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
  );
};
