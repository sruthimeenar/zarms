import { AdminUser } from './types';

// Mock admin user - will be replaced with authentication system later
export const adminUser: AdminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@zarmstec.com',
  role: 'Administrator',
  avatar: undefined,
};

export const getAdminUser = (): AdminUser => {
  return { ...adminUser };
};

export const updateAdminUser = (updates: Partial<AdminUser>): AdminUser => {
  Object.assign(adminUser, updates);
  return { ...adminUser };
};
