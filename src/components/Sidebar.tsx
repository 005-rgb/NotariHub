import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Users2, 
  PieChart,
  Zap,
  Lock,
  ChevronLeft,
  ChevronRight,
  Building2,
  Briefcase,
  Home,
  Scale,
  Heart,
  Globe,
  FilePenLine,
  FileBarChart,
  BadgeDollarSign,
  FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { useFeatures } from '../context/FeatureContext';
import { useUi } from '../context/UiContext';
import { UserProfile } from '../types';

interface SidebarProps {
  profile: UserProfile | null;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ profile, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { settings } = useFeatures();
  const { setIsSubmissionModalOpen } = useUi();

  const handleLogout = () => {
    NotaryHttpClient.clearSession();
    navigate('/login');
  };

  const menuGroups = [
    {
      title: 'Main Navigation',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users2, label: 'Direktori Konsumen', path: '/consumers' },
        { icon: FileBarChart, label: 'Direktori Laporan', path: '/reports' },
        { icon: FilePenLine, label: 'Update Ajuan', path: '/update-ajuan' },
      ]
    },
    {
      title: '6 Rumpun Hukum',
      items: [
        { icon: Home, label: 'Pertanahan', path: '/hukum/pertanahan' },
        { icon: Building2, label: 'Badan Hukum', path: '/hukum/badan-hukum' },
        { icon: Briefcase, label: 'Perbankan', path: '/hukum/perbankan' },
        { icon: FileText, label: 'Perjanjian', path: '/hukum/perjanjian' },
        { icon: Heart, label: 'Keluarga & Waris', path: '/hukum/keluarga' },
        { icon: Globe, label: 'Umum', path: '/hukum/umum' },
      ]
    },
    {
      title: 'Intelligence & Reports',
      items: [
        { 
          icon: Zap, 
          label: 'AI Assistant', 
          path: '/ai-assistant',
          isAi: true
        },
      ]
    }
  ];

  const adminItems = [
    { icon: Users, label: 'Staff Management', path: '/staff', roles: ['NOTARIS', 'STAF_UTAMA'] },
    { icon: Settings, label: 'Tenant Settings', path: '/tenant-settings', roles: ['NOTARIS'] },
    { icon: ShieldCheck, label: 'System Config', path: '/admin/settings', roles: ['SUPER_ADMIN'] },
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F172A] text-white transition-all duration-500 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.1)]",
        collapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Top Section: Logo & Office Name */}
      <div className="flex h-24 items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-[#8B7344] shadow-lg shadow-gold/20">
            <Scale className="h-6 w-6 text-navy" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-tight">
                Notaris<span className="text-gold">Hub</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Premium Office
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-28 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-navy shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Middle Section: Navigation */}
      <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
        <div className="space-y-8">
          {/* Action Button: Ajuan Baru */}
          {!collapsed && (
            <div className="px-2 mb-6">
              <button 
                onClick={() => setIsSubmissionModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 bg-gold hover:bg-[#B19251] text-navy font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <Zap className="h-4 w-4 fill-navy transition-transform group-hover:rotate-12" />
                <span>+ Ajuan Baru</span>
              </button>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={() => setIsSubmissionModalOpen(true)}
                className="h-12 w-12 flex items-center justify-center bg-gold text-navy rounded-2xl shadow-lg shadow-gold/20 hover:scale-110 transition-transform"
                title="Ajuan Baru"
              >
                <Zap className="h-5 w-5 fill-navy" />
              </button>
            </div>
          )}

          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {!collapsed && (
                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isAiLocked = item.isAi && !settings?.is_ai_enabled;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={isAiLocked ? '#' : item.path}
                      onClick={(e) => isAiLocked && e.preventDefault()}
                      className={({ isActive }) => cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                        isActive && !isAiLocked
                          ? "bg-gold/10 text-gold shadow-[inset_0_0_20px_rgba(194,163,93,0.1)]" 
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                        isAiLocked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="relative">
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                          isAiLocked ? "text-slate-600" : ""
                        )} />
                        {isAiLocked && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-navy p-0.5 ring-1 ring-white/10">
                            <Lock className="h-2 w-2 text-gold" />
                          </div>
                        )}
                      </div>
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && isAiLocked && (
                        <Lock className="h-3 w-3 text-slate-600" />
                      )}
                    </NavLink>
                  );
                })}

                {/* Laporan Keuangan — Coming Soon (after Main Navigation group) */}
                {idx === 0 && (
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold opacity-40 grayscale pointer-events-none text-slate-400">
                    <BadgeDollarSign className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">Laporan Keuangan</span>
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                          Coming Soon
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Admin Section */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            {!collapsed && (
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Administration
              </h3>
            )}
            <div className="space-y-1">
              {adminItems
                .filter(item => !item.roles || (profile && item.roles.includes(profile.role)))
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                      isActive 
                        ? "bg-gold/10 text-gold" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </NavLink>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: User Profile */}
      <div className="p-4 border-t border-white/5 bg-navy/50 backdrop-blur-sm">
        <div className={cn(
          "flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 transition-all duration-300",
          collapsed ? "justify-center" : ""
        )}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-black text-gold ring-1 ring-white/20">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-black text-white uppercase tracking-tight">
                {profile?.username || 'User'}
              </p>
              <p className="truncate text-[9px] font-bold text-gold uppercase tracking-widest">
                {profile?.role || 'Guest'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={handleLogout}
              className="group rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
        {collapsed && (
           <button 
           onClick={handleLogout}
           className="mt-2 flex w-full justify-center rounded-xl p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
         >
           <LogOut className="h-4 w-4" />
         </button>
        )}
      </div>
    </aside>
  );
};
