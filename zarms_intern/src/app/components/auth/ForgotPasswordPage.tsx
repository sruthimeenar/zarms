import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { initiateForgotPassword, validateEmail } from '../../../data/authService';
import { Link } from 'react-router';
import { AuthLayout } from './AuthLayout';

interface ForgotPasswordPageProps {
  onOTPSent: (email: string) => void;
}

export function ForgotPasswordPage({ onOTPSent }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    const result = await initiateForgotPassword(email);

    setLoading(false);

    if (result.success) {
      onOTPSent(email);
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            Forgot Password?
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Enter your email to receive an OTP
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
            <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-medium transition-shadow hover:shadow-md text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#1e3a8a', color: '#ffffff' }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-50"
            style={{ background: '#f8fafc', color: '#64748b' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
}
