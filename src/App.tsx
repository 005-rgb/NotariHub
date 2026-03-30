import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutWrapper } from './components/LayoutWrapper';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { NewSubmissionForm } from './components/NewSubmissionForm';
import { SuperAdminSettings } from './components/SuperAdminSettings';
import { AiOcrExtractor } from './components/AiOcrExtractor';
import { ConsumerDirectory } from './components/ConsumerDirectory';
import { IdentityGuard } from './components/IdentityGuard';
import { Loader2, UserCircle } from 'lucide-react';
import { UserProfile } from './types';
import { NotaryHttpClient } from './lib/NotaryHttpClient';

import { FeatureProvider } from './context/FeatureContext';
import { UiProvider } from './context/UiContext';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('userRole') || 'NOTARIS');

  const toggleRole = () => {
    const roles = ['NOTARIS', 'STAF_UTAMA', 'SUPER_ADMIN'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    localStorage.setItem('userRole', nextRole);
    setCurrentRole(nextRole);
    window.location.reload(); // Reload to apply role change across app
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { tid } = NotaryHttpClient.getContext();
      const token = localStorage.getItem('APP_SESSION_ID_token');

      // For demo purposes, if no token, we mock a profile based on currentRole
      if (!token) {
        setProfile({
          id: 'user-1',
          tenant_id: 'tenant-1',
          username: 'demo_user',
          email: 'demo@notaris.id',
          role: currentRole as any,
          created_at: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      if (token && tid) {
        try {
          const res = await NotaryHttpClient.get('/api/users/profile');
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          } else {
            NotaryHttpClient.clearSession();
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [currentRole]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <FeatureProvider>
      <UiProvider>
        <Router>
          {/* Demo Role Switcher */}
          <div className="fixed bottom-4 left-4 z-[200]">
            <button 
              onClick={toggleRole}
              className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full shadow-2xl border border-gold/30 hover:scale-105 transition-all"
            >
              <UserCircle className="h-4 w-4 text-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest">Role: {currentRole}</span>
            </button>
          </div>

          <Routes>
            <Route
              path="/login"
              element={profile ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={
                <IdentityGuard>
                  <LayoutWrapper profile={profile}>
                    <Dashboard role={profile?.role || 'GUEST'} authorName={profile?.username || 'Notaris'} />
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route
              path="/folders/new"
              element={
                <IdentityGuard>
                  <LayoutWrapper profile={profile}>
                    <NewSubmissionForm />
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <IdentityGuard requiredRole="SUPER_ADMIN">
                  <LayoutWrapper profile={profile}>
                    <SuperAdminSettings />
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route
              path="/staff"
              element={
                <IdentityGuard requiredRole="NOTARIS">
                  <LayoutWrapper profile={profile}>
                    <div className="glass-card rounded-3xl p-12 ring-1 ring-gold/10">
                      <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Staff Management</h2>
                      <p className="mt-2 text-sm font-medium text-slate">Manage your office staff and their access levels.</p>
                    </div>
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route
              path="/tenant-settings"
              element={
                <IdentityGuard requiredRole="NOTARIS">
                  <LayoutWrapper profile={profile}>
                    <div className="glass-card rounded-3xl p-12 ring-1 ring-gold/10">
                      <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Tenant Settings</h2>
                      <p className="mt-2 text-sm font-medium text-slate">Configure your office profile and service packages.</p>
                    </div>
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route
              path="/consumers"
              element={
                <IdentityGuard>
                  <LayoutWrapper profile={profile}>
                    <ConsumerDirectory profile={profile} />
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <IdentityGuard>
                  <LayoutWrapper profile={profile}>
                    <AiOcrExtractor profile={profile} />
                  </LayoutWrapper>
                </IdentityGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </UiProvider>
    </FeatureProvider>
  );
}
