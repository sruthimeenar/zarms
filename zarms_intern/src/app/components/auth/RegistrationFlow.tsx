import { useState } from 'react';
import { useNavigate } from 'react-router';
import { RegisterPage } from './RegisterPage';
import { OTPVerification } from './OTPVerification';
import { SetPasswordPage } from './SetPasswordPage';

type RegistrationStep = 'register' | 'otp' | 'password';

export function RegistrationFlow() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('register');
  const [email, setEmail] = useState('');
  const [registrationData, setRegistrationData] = useState<{ name: string; mobile: string }>({ name: '', mobile: '' });
  const navigate = useNavigate();

  const handleRegistrationInitiated = (userEmail: string, name: string, mobile: string) => {
    setEmail(userEmail);
    setRegistrationData({ name, mobile });
    setCurrentStep('otp');
  };

  const handleOTPVerified = () => {
    setCurrentStep('password');
  };

  const handleRegistrationComplete = () => {
    navigate('/login?registered=true');
  };

  const handleBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('register');
    } else if (currentStep === 'password') {
      setCurrentStep('otp');
    }
  };

  return (
    <>
      {currentStep === 'register' && (
        <RegisterPage onRegistrationInitiated={handleRegistrationInitiated} />
      )}
      {currentStep === 'otp' && (
        <OTPVerification
          email={email}
          type="registration"
          registrationData={registrationData}
          onVerified={handleOTPVerified}
          onBack={handleBack}
        />
      )}
      {currentStep === 'password' && (
        <SetPasswordPage
          email={email}
          onComplete={handleRegistrationComplete}
        />
      )}
    </>
  );
}
