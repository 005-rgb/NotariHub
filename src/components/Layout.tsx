import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { ChevronRight, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  profile: UserProfile | null;
}

/**
 * LayoutWrapper Component
 * 
 * Provides a persistent structure for the application, ensuring the Sidebar
 * does not re-render during page transitions.
 */
export const Layout: React.FC<LayoutProps> = ({ children, profile }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Breadcrumb logic
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPathLabel = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').toUpperCase()
    : 'DASHBOARD';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <div className={cn(
        "hidden lg:block transition-all duration-500 ease-in-out",
        collapsed ? "w-20" : "w-[280px]"
      )}>
        <Sidebar 
          profile={profile} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[70] w-[280px] transform transition-transform duration-500 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          profile={profile} 
          collapsed={false} 
          setCollapsed={() => setMobileOpen(false)} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Soft Shadow Transition */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10 hidden lg:block" />

        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-zinc-200/50 bg-white/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileOpen(true)} 
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy hover:bg-navy/10 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              <span className="hover:text-navy cursor-pointer transition-colors">NotarisHub</span>
              <ChevronRight className="h-3 w-3 text-gold" />
              <span className="text-navy font-black">{currentPathLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions or Notifications could go here */}
            <div className="hidden md:flex h-10 items-center px-4 rounded-xl bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-widest">
              Premium Account
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
