export type UserRole = 'admin' | 'superadmin';
export type AccountStatus = 'active' | 'suspended' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  status: AccountStatus;
  primary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface OTPRecord {
  id: string;
  email: string;
  otp: string;
  type: 'registration' | 'forgot-password';
  expiresAt: string;
  attempts: number;
  resendCount: number;
  createdAt: string;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  mobile: string;
  otpVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
