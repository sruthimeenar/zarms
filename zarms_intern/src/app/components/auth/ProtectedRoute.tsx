import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getCurrentSession, validateSessionWithServer } from '../../../data/authService';
import { UserRole } from '../../../data/authTypes';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [session, setSession] = useState(getCurrentSession());

  useEffect(() => {
    let active = true;
    validateSessionWithServer()
      .then((validatedSession) => {
        if (!active) return;
        setSession(validatedSession);
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc', color: '#475569' }}>
        Verifying session...
      </div>
    );
  }

  if (!session.isAuthenticated || !session.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
