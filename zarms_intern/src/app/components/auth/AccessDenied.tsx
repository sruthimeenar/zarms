import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { AuthLayout } from './AuthLayout';

export function AccessDenied() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 rounded-lg text-center" style={{ background: '#ffffff', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
        <div className="inline-flex p-4 rounded-full mb-6" style={{ background: '#fee2e2' }}>
          <ShieldAlert className="w-12 h-12" style={{ color: '#dc2626' }} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: '#0f172a' }}>
          Access Denied
        </h1>
        <p className="text-sm mb-8" style={{ color: '#64748b' }}>
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-shadow hover:shadow-md text-sm cursor-pointer"
          style={{ background: '#1e3a8a', color: '#ffffff' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </AuthLayout>
  );
}
