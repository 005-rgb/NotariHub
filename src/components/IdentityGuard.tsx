import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { JWTPayload } from '../types';

interface GuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const IdentityGuard: React.FC<GuardProps> = ({ children, requiredRole }) => {
  const [searchParams] = useSearchParams();
  const [identity, setIdentity] = useState<JWTPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const tid = searchParams.get('tid') || NotaryHttpClient.getContext().tid;

  useEffect(() => {
    const verifyIdentity = () => {
      const token = localStorage.getItem('APP_SESSION_ID_token');
      const demoRole = localStorage.getItem('userRole');
      
      if (token && tid) {
        try {
          // Mock JWT Decoding for now
          const payload: JWTPayload = {
            uid: 'user-1',
            tid: tid,
            role: (demoRole as any) || 'NOTARIS',
            exp: Date.now() + 3600000
          };

          if (payload && payload.tid === tid) {
            if (!requiredRole || payload.role === requiredRole) {
              setIdentity(payload);
              NotaryHttpClient.setSession(token, payload.tid, payload.role);
            }
          } else {
            NotaryHttpClient.clearSession();
          }
        } catch {
          NotaryHttpClient.clearSession();
        }
      } else if (!token && demoRole && tid) {
        // Demo mode: allow access if userRole is present in localStorage
        const payload: JWTPayload = {
          uid: 'user-1',
          tid: tid,
          role: demoRole as any,
          exp: Date.now() + 3600000
        };
        
        if (!requiredRole || payload.role === requiredRole) {
          setIdentity(payload);
        }
      }
      setIsVerifying(false);
    };

    verifyIdentity();
  }, [tid, requiredRole]);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-600" />
      </div>
    );
  }

  if (!identity) {
    const loginPath = tid ? `/login?tid=${tid}` : '/login';
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
};
