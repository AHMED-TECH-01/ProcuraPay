import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../../client/api';
import { UserProfile } from '../../types/auth';

interface LoginFormProps {
  onSuccess: (user: UserProfile) => void;
  onRequireVerification: (email: string) => void;
  onNavigateForgotPassword: () => void;
  onNavigateSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onRequireVerification,
  onNavigateForgotPassword,
  onNavigateSignup,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your work email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login({ email: email.trim().toLowerCase(), password });
      if (res.isVerified && res.session?.user) {
        onSuccess(res.session.user);
      } else {
        onRequireVerification(email);
      }
    } catch (err: any) {
      if (err.isVerified === false) {
        onRequireVerification(err.email || email);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('muhammadahmedrazartx@gmail.com');
    setPassword('Password123!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Quick Demo Credentials Assistant */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5 flex items-center justify-between">
        <span className="text-[11px] text-emerald-900 font-medium">Test Account Ready:</span>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="text-[11px] font-bold text-[#187B61] hover:underline"
        >
          Auto-fill Owner Credentials
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          Work Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#187B61] focus:border-[#187B61] outline-hidden text-xs"
          required
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Password
          </label>
          <button
            type="button"
            onClick={onNavigateForgotPassword}
            className="text-[11px] font-semibold text-[#187B61] hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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
      </div>

      {/* Remember me */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded text-[#187B61] focus:ring-[#187B61]"
          />
          <span className="text-[11px] text-gray-600">Remember this device</span>
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
            <span>Authenticating...</span>
          </>
        ) : (
          <span>Sign In to ProcuraPay AI</span>
        )}
      </button>

      {/* Switch to Signup */}
      <div className="text-center pt-2">
        <span className="text-gray-500">Don't have an enterprise account? </span>
        <button
          type="button"
          onClick={onNavigateSignup}
          className="text-[#187B61] font-bold hover:underline"
        >
          Create Account
        </button>
      </div>
    </form>
  );
};
