// Legacy initializer retained for compatibility.
// In production mode users are initialized via backend SQL/bootstrap only.
export const initializeAuthSystem = async () => {
  return;
};

export const isAuthSystemInitialized = (): boolean => true;
