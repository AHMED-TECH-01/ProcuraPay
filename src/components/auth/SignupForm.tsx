import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../client/api';

interface SignupFormProps {
  onSuccess: (email: string, token: string) => void;
  onNavigateLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid work email address.');
      return;
    }

    if (companyName.trim().length < 2) {
      setError('Company name must be at least 2 characters long.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        companyName: companyName.trim(),
      });
      onSuccess(res.user.email, res.verificationToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Sarah Jenkins"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden text-xs"
          required
        />
      </div>

      {/* Work Email */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Work Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sarah@acme-corp.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden text-xs"
          required
        />
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Global Logistics"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden text-xs"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden text-xs"
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

        {/* Password strength bar */}
        {password && (
          <div className="mt-1.5 space-y-1">
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`flex-1 rounded-full ${
                    strength >= level
                      ? strength <= 2
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 block">
              {strength <= 1 && 'Weak password'}
              {strength === 2 && 'Fair password — include numbers & symbols'}
              {strength >= 3 && 'Strong password'}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden text-xs"
          required
        />
      </div>

      {/* Terms & Conditions */}
      <div className="pt-1">
        <label className="flex items-start space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="rounded text-[#187B61] focus:ring-[#187B61] mt-0.5"
            required
          />
          <span className="text-[11px] text-gray-600 leading-tight">
            I agree to the <span className="text-[#187B61] font-semibold">Terms of Service</span> and acknowledge the <span className="text-[#187B61] font-semibold">Privacy Policy</span>.
          </span>
        </label>
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
            <span>Creating Enterprise Account...</span>
          </>
        ) : (
          <span>Create Account & Verify Email</span>
        )}
      </button>

      {/* Switch to Login */}
      <div className="text-center pt-2">
        <span className="text-gray-500">Already have an account? </span>
        <button
          type="button"
          onClick={onNavigateLogin}
          className="text-[#187B61] font-bold hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};
