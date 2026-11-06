import { useState } from 'react';
import { User, Mail, Phone, UserPlus } from 'lucide-react';
import { initiateRegistration, validateEmail, validateMobile } from '../../../data/authService';
import { Link } from 'react-router';
import { AuthLayout } from './AuthLayout';

interface RegisterPageProps {
  onRegistrationInitiated: (email: string, name: string, mobile: string) => void;
}

export function RegisterPage({ onRegistrationInitiated }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number (must be 10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    const result = await initiateRegistration(
      formData.name,
      formData.email,
      formData.mobile
    );

    setLoading(false);

    if (result.success) {
      onRegistrationInitiated(formData.email, formData.name, formData.mobile);
    } else {
      setErrors({ general: result.message });
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            Create Account
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Register to become an admin
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
            <p className="text-sm" style={{ color: '#dc2626' }}>{errors.general}</p>
          </div>
        )}

        {/* Info Message */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <p className="text-xs" style={{ color: '#1e3a8a' }}>
            After submitting, an OTP will be sent to the primary admin. The admin will share the OTP with you for verification.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: errors.name ? '#fca5a5' : '#e2e8f0', color: '#0f172a' }}
                placeholder="Enter your full name"
                required
              />
            </div>
            {errors.name && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: errors.email ? '#fca5a5' : '#e2e8f0', color: '#0f172a' }}
                placeholder="Enter your email"
                required
              />
            </div>
            {errors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.email}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94a3b8' }} />
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: errors.mobile ? '#fca5a5' : '#e2e8f0', color: '#0f172a' }}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
            {errors.mobile && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.mobile}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-shadow hover:shadow-md text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#1e3a8a', color: '#ffffff' }}
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Continue to OTP Verification
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#64748b' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline cursor-pointer"
              style={{ color: '#1e3a8a' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
