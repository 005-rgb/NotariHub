import React from 'react';
import { useUi } from '../context/UiContext';
import { Sidebar } from './Sidebar';
import { HistoryTimeline } from './HistoryTimeline';
import { UserProfile, FolderActivity } from '../types';
import { cn } from '../lib/utils';
import { Menu, X, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { SubmissionModal } from './SubmissionModal';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutWrapperProps {
  children: React.ReactNode;
  profile: UserProfile | null;
}

const MOCK_ACTIVITIES: FolderActivity[] = [
  {
    id: 'act-1',
    user_id: 'user-1',
    user_name: 'Siti Aminah',
    user_role: 'STAF_UTAMA',
    folder_id: 'folder-1',
    action_type: 'ASSET_UPLOAD',
    asset_name: 'PBB_2025_Budi.pdf',
    payload_change: { description: 'Uploaded PBB 2025' },
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'act-2',
    user_id: 'user-2',
    user_name: 'Notaris Jakarta',
    user_role: 'NOTARIS',
    folder_id: 'folder-1',
    action_type: 'STATUS_ROLLBACK',
    payload_change: { 
      description: 'Rolled back status to Milestone 3',
      reason: 'Dokumen PPH belum tervalidasi dengan benar.' 
    },
    created_at: new Date(Date.now() - 1200000).toISOString(),
  }
];

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children, profile }) => {
  const { 
    isSidebarOpen, 
    setIsSidebarOpen, 
    isLivePulseOpen, 
    setIsLivePulseOpen,
    isSubmissionModalOpen,
    setIsSubmissionModalOpen,
    toast,
  } = useUi();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Left Sidebar */}
      <div className={cn(
        "transition-all duration-500 ease-in-out shrink-0 z-50",
        isSidebarOpen ? "w-[280px]" : "w-20"
      )}>
        <Sidebar 
          profile={profile} 
          collapsed={!isSidebarOpen} 
          setCollapsed={(val) => setIsSidebarOpen(!val)} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-navy"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>NotarisHub</span>
              <ChevronRight className="h-3 w-3 text-gold" />
              <span className="text-navy">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLivePulseOpen(!isLivePulseOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isLivePulseOpen ? "bg-gold text-navy shadow-lg shadow-gold/20" : "bg-navy/5 text-navy hover:bg-navy/10"
              )}
            >
              <Activity className="h-4 w-4" />
              <span>Live Pulse</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Right Sidebar (Live Pulse) */}
      <div className={cn(
        "transition-all duration-500 ease-in-out shrink-0 border-l border-zinc-200 bg-white z-50",
        isLivePulseOpen ? "w-[350px]" : "w-0 opacity-0 pointer-events-none"
      )}>
        <div className="w-[350px] h-full flex flex-col">
          <div className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gold" />
              <h3 className="text-sm font-bold text-navy uppercase tracking-tight">Live Pulse</h3>
            </div>
            <button 
              onClick={() => setIsLivePulseOpen(false)}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <HistoryTimeline activities={MOCK_ACTIVITIES} />
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <SubmissionModal 
        isOpen={isSubmissionModalOpen} 
        onClose={() => setIsSubmissionModalOpen(false)} 
        profile={profile}
      />

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur"
          >
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-[0.15em]">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
