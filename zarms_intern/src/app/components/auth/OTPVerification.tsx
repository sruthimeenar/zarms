import { useState, useEffect } from 'react';
import { Shield, RotateCw } from 'lucide-react';
import { verifyRegistrationOTP, verifyForgotPasswordOTP, resendOTP } from '../../../data/authService';
import { AuthLayout } from './AuthLayout';

interface OTPVerificationProps {
  email: string;
  type: 'registration' | 'forgot-password';
  registrationData?: { name: string; mobile: string };
  onVerified: () => void;
  onBack: () => void;
}

export function OTPVerification({ email, type, registrationData, onVerified, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value.slice(-1);
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOTP = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOTP[i] = pastedData[i];
    }
    setOtp(newOTP);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setLoading(true);

    const result = type === 'registration'
      ? await verifyRegistrationOTP(email, otpValue)
      : await verifyForgotPasswordOTP(email, otpValue);

    setLoading(false);

    if (result.success) {
      onVerified();
    } else {
      setError(result.message);
      setOtp(['', '', '', '', '', '']);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    const result = await resendOTP(email, type, registrationData);

    if (result.success) {
      setCanResend(false);
      setResendCountdown(60);
      setOtp(['', '', '', '', '', '']);
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
            <Shield className="w-8 h-8" style={{ color: '#1e3a8a' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
            Verify OTP
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            {type === 'registration'
              ? 'Enter the OTP shared by the admin'
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
            <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-lg font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' }}
              />
            ))}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline cursor-pointer"
                style={{ color: '#1e3a8a' }}
              >
                <RotateCw className="w-4 h-4" />
                Resend OTP
              </button>
            ) : (
              <p className="text-sm" style={{ color: '#64748b' }}>
                Resend OTP in {resendCountdown}s
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full px-6 py-3 rounded-lg font-medium transition-shadow hover:shadow-md text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#1e3a8a', color: '#ffffff' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="w-full px-6 py-3 rounded-lg font-medium text-sm cursor-pointer hover:bg-gray-50"
            style={{ background: '#f8fafc', color: '#64748b' }}
          >
            Back
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
