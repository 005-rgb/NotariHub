import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { LogIn, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tid = searchParams.get('tid');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock Login
      if (email === 'admin@notaris.id' && password === 'admin123') {
        const mockToken = 'mock-jwt-token';
        const mockRole = 'NOTARIS';
        const mockTid = tid || 'tenant-1';
        
        NotaryHttpClient.setSession(mockToken, mockTid, mockRole);
        navigate(mockTid ? `/?tid=${mockTid}` : '/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">NotarisHub</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {tid ? `Secure login for ${tid}` : 'Secure multi-tenant management for notary offices.'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm"
                placeholder="admin@notaris.id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50",
              loading && "cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
