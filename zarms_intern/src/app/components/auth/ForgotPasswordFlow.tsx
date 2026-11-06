import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { OTPVerification } from './OTPVerification';
import { ResetPasswordPage } from './ResetPasswordPage';

type ForgotPasswordStep = 'email' | 'otp' | 'reset';

export function ForgotPasswordFlow() {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleOTPSent = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep('otp');
  };

  const handleOTPVerified = () => {
    setCurrentStep('reset');
  };

  const handlePasswordReset = () => {
    navigate('/login?reset=true');
  };

  const handleBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('email');
    } else if (currentStep === 'reset') {
      setCurrentStep('otp');
    }
  };

  return (
    <>
      {currentStep === 'email' && (
        <ForgotPasswordPage onOTPSent={handleOTPSent} />
      )}
      {currentStep === 'otp' && (
        <OTPVerification
          email={email}
          type="forgot-password"
          onVerified={handleOTPVerified}
          onBack={handleBack}
        />
      )}
      {currentStep === 'reset' && (
        <ResetPasswordPage
          email={email}
          onComplete={handlePasswordReset}
        />
      )}
    </>
  );
}
