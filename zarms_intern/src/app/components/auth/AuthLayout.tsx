import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Logo Header */}
      <div className="w-full py-6">
        <div className="max-w-md mx-auto px-8">
          <div className="text-center">
            <img src="/images/logo.png" alt="ZARMS Tec" className="h-14 w-auto mx-auto" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>

      {/* Footer */}
      <div className="w-full py-6">
        <div className="max-w-md mx-auto px-8">
          <div className="text-center space-y-2">
            <p className="text-xs" style={{ color: '#64748b' }}>
              &copy; {new Date().getFullYear()} ZARMS Tec. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Designed & Developed by{' '}
              <a
                href="https://amasqis.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline cursor-pointer"
                style={{ color: '#1e3a8a' }}
              >
                amasQIS.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
