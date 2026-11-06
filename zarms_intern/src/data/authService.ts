import { AuthState, User } from './authTypes';
import { apiRequest } from './apiClient';

const CURRENT_SESSION_KEY = 'zarms_current_session';
const REG_REQUESTS_KEY = 'zarms_registration_requests';
const RESET_VERIFIED_OTP_KEY = 'zarms_reset_verified_otp';

const getRegistrationMap = (): Record<string, number> => {
  const raw = localStorage.getItem(REG_REQUESTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveRegistrationMap = (map: Record<string, number>) => {
  localStorage.setItem(REG_REQUESTS_KEY, JSON.stringify(map));
};

const getVerifiedResetMap = (): Record<string, string> => {
  const raw = sessionStorage.getItem(RESET_VERIFIED_OTP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveVerifiedResetMap = (map: Record<string, string>) => {
  sessionStorage.setItem(RESET_VERIFIED_OTP_KEY, JSON.stringify(map));
};

const mapApiUser = (user: any): User => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  mobile: user.phone || '',
  password: '',
  role: user.role,
  status: user.status || 'active',
  primary: !!user.isPrimaryAdmin,
  createdAt: user.created_at || new Date().toISOString(),
  updatedAt: user.updated_at || new Date().toISOString(),
});

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true };
};

export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateMobile = (mobile: string): boolean => /^[0-9]{10}$/.test(mobile.replace(/\s/g, ''));

export const initiateRegistration = async (name: string, email: string, mobile: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await apiRequest<{ requestId: number; message: string }>('api/auth/register-initiate', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone: mobile }),
    });

    const map = getRegistrationMap();
    map[email.toLowerCase()] = Number(data.requestId);
    saveRegistrationMap(map);

    return { success: true, message: data.message || 'Registration initiated' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to initiate registration' };
  }
};

export const verifyRegistrationOTP = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await apiRequest<{ message: string }>('api/auth/register-verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    return { success: true, message: data.message || 'OTP verified successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to verify OTP' };
  }
};

export const completeRegistration = async (email: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (password !== confirmPassword) return { success: false, message: 'Passwords do not match' };

    const data = await apiRequest<{ message: string }>('api/auth/register-complete', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const map = getRegistrationMap();
    delete map[email.toLowerCase()];
    saveRegistrationMap(map);

    return { success: true, message: data.message || 'Registration completed successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to complete registration' };
  }
};

export const resendOTP = async (email: string, type: 'registration' | 'forgot-password', registrationData?: { name: string; mobile: string }): Promise<{ success: boolean; message: string }> => {
  try {
    if (type === 'forgot-password') {
      const data = await apiRequest<{ message: string }>('api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true, message: data.message || 'OTP resent successfully' };
    }

    if (type === 'registration' && registrationData) {
      const data = await apiRequest<{ requestId: number; message: string }>('api/auth/register-initiate', {
        method: 'POST',
        body: JSON.stringify({ name: registrationData.name, email, phone: registrationData.mobile }),
      });
      const map = getRegistrationMap();
      map[email.toLowerCase()] = Number(data.requestId);
      saveRegistrationMap(map);
      return { success: true, message: 'OTP resent to admin successfully' };
    }

    return { success: false, message: 'Unable to resend OTP. Please restart registration.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to resend OTP' };
  }
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User; token?: string }> => {
  try {
    const data = await apiRequest<{ token: string; user: any; message: string }>('api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = mapApiUser(data.user);
    sessionStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify({ user, token: data.token }));

    return { success: true, message: data.message || 'Login successful', user, token: data.token };
  } catch (error: any) {
    return { success: false, message: error.message || 'Login failed' };
  }
};

export const logout = async () => {
  try {
    await apiRequest('api/auth/logout', { method: 'POST' });
  } catch {
    // ignore backend logout errors during client cleanup
  }
  sessionStorage.removeItem(CURRENT_SESSION_KEY);
};

export const getCurrentSession = (): AuthState => {
  const raw = sessionStorage.getItem(CURRENT_SESSION_KEY);
  if (!raw) return { user: null, token: null, isAuthenticated: false };

  try {
    const { user, token } = JSON.parse(raw);
    return { user, token, isAuthenticated: !!user && !!token };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
};

export const validateSessionWithServer = async (): Promise<AuthState> => {
  const local = getCurrentSession();
  if (!local.token) {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const data = await apiRequest<{ valid: boolean; user: any }>('api/auth/session');
    if (!data.valid || !data.user) {
      sessionStorage.removeItem(CURRENT_SESSION_KEY);
      return { user: null, token: null, isAuthenticated: false };
    }

    const user = mapApiUser(data.user);
    const session = { user, token: local.token };
    sessionStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    return { user, token: local.token, isAuthenticated: true };
  } catch {
    sessionStorage.removeItem(CURRENT_SESSION_KEY);
    return { user: null, token: null, isAuthenticated: false };
  }
};

export const initiateForgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await apiRequest<{ message: string }>('api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: true, message: data.message || 'If this email exists, an OTP has been sent.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
};

export const verifyForgotPasswordOTP = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await apiRequest<{ message: string }>('api/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    const map = getVerifiedResetMap();
    map[email.toLowerCase()] = otp;
    saveVerifiedResetMap(map);

    return { success: true, message: data.message || 'OTP verified successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to verify OTP' };
  }
};

export const resetPassword = async (email: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (newPassword !== confirmPassword) return { success: false, message: 'Passwords do not match' };

    const otpMap = getVerifiedResetMap();
    const otp = otpMap[email.toLowerCase()];
    if (!otp) return { success: false, message: 'OTP verification required before password reset.' };

    const data = await apiRequest<{ message: string }>('api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password: newPassword }),
    });

    delete otpMap[email.toLowerCase()];
    saveVerifiedResetMap(otpMap);

    return { success: true, message: data.message || 'Password reset successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to reset password' };
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const data = await apiRequest<{ users: any[] }>('api/users/list');
  return (data.users || []).map(mapApiUser);
};

export const addAdmin = async (name: string, email: string, mobile: string, password?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const payload: any = { name, email, phone: mobile, role: 'admin' };
    if (password !== undefined) payload.password = password;

    const data = await apiRequest<{ message: string }>('api/users/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { success: true, message: data.message || 'Admin created successfully. Password has been sent to their email.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create admin' };
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> => {
  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.mobile !== undefined) payload.phone = updates.mobile;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.status !== undefined) payload.status = updates.status;

    await apiRequest(`api/users/update/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return { success: true, message: 'User updated successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update user' };
  }
};

export const setPrimaryAdmin = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    await apiRequest(`api/users/set-primary-admin/${userId}`, { method: 'POST' });
    return { success: true, message: 'Primary admin updated successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to set primary admin' };
  }
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    await apiRequest(`api/users/delete/${userId}`, { method: 'DELETE' });
    return { success: true, message: 'User deleted successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete user' };
  }
};

export const initializeSuperadmin = async (_name: string, _email: string, _mobile: string, _password: string): Promise<{ success: boolean; message: string }> => {
  return { success: false, message: 'Not supported in production mode. Use backend setup.sql seeding.' };
};
