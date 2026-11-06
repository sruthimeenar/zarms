import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { resetPassword, validatePassword } from '../../../data/authService';
import { AuthLayout } from './AuthLayout';

interface ResetPasswordPageProps {
  email: string;
  onComplete: () => void;
}

export function ResetPasswordPage({ email, onComplete }: ResetPasswordPageProps) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password);
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (!validation.valid) return { strength: 1, label: 'Weak', color: '#dc2626' };
    if (password.length < 10) return { strength: 2, label: 'Medium', color: '#d97706' };
    return { strength: 3, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.valid) {
      setError(validation.message || 'Invalid password');
      return;
    }

    setLoading(true);

    const result = await resetPassword(email, formData.password, formData.confirmPassword);

    setLoading(false);

    if (result.success) {
      onComplete();
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full mb-4" style={{ background: '#eff6ff' }}>
            <Lock className="w-8 h-8" style={{ color: '#1e3a8a' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Create a new password for your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
            <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* Password Requirements */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Password must contain:</p>
          <ul className="space-y-1 text-xs" style={{ color: '#64748b' }}>
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
            <li>• One special character</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{ background: level <= passwordStrength.strength ? passwordStrength.color : '#e2e8f0' }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: passwordStrength.color }}>{passwordStrength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: '#94a3b8' }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-shadow hover:shadow-md text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#1e3a8a', color: '#ffffff' }}
          >
            {loading ? (
              'Resetting Password...'
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Reset Password
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg text-center" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <p className="text-xs" style={{ color: '#d97706' }}>
            After resetting, all active sessions will be logged out for security
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
