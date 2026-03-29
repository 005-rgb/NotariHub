import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  FileText, 
  Clock,
  ShieldCheck,
  PenTool
} from 'lucide-react';
import { FolderActivity } from '../types';
import { cn } from '../lib/utils';

interface HistoryTimelineProps {
  activities: FolderActivity[];
}

// Helper to get relative time (simplified)
const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};

const ActivityIcon = ({ type, role }: { type: string, role: string }) => {
  const isNotary = role === 'NOTARIS';
  
  switch (type) {
    case 'ASSET_UPLOAD':
      return <FileUp className={cn("h-4 w-4", isNotary ? "text-gold" : "text-slate")} />;
    case 'STATUS_ROLLBACK':
      return <RotateCcw className="h-4 w-4 text-red-500" />;
    case 'SIGNING':
      return <PenTool className="h-4 w-4 text-gold" />;
    case 'VERIFICATION':
      return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
    default:
      return <CheckCircle2 className={cn("h-4 w-4", isNotary ? "text-gold" : "text-slate")} />;
  }
};

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ activities }) => {
  // Sort activities by newest first
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="w-[350px] h-full flex flex-col bg-slate-50/50 backdrop-blur-xl border-l border-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-zinc-100 bg-white/40">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4 text-gold" />
            Live Pulse
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="relative">
          {/* Vertical Stepper Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-200" />

          <div className="space-y-8">
            <AnimatePresence initial={false}>
              {sortedActivities.map((activity) => {
                const isNotary = activity.user_role === 'NOTARIS';
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative pl-10 group"
                  >
                    {/* Activity Dot/Icon Container */}
                    <div className={cn(
                      "absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-50 transition-all duration-300",
                      isNotary ? "bg-navy text-gold shadow-lg gold-glow" : "bg-white text-slate shadow-sm"
                    )}>
                      <ActivityIcon type={activity.action_type} role={activity.user_role} />
                    </div>

                    {/* Activity Card */}
                    <div className="glass-card rounded-2xl p-4 ring-1 ring-zinc-100 group-hover:ring-gold/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-black uppercase",
                            isNotary ? "bg-gold text-navy" : "bg-navy text-white"
                          )}>
                            {activity.user_name.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black text-navy uppercase tracking-tight">
                            {activity.user_name}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-slate uppercase tracking-tighter">
                          {getRelativeTime(activity.created_at)}
                        </span>
                      </div>

                      <p className={cn(
                        "text-xs leading-relaxed font-medium",
                        isNotary ? "text-navy" : "text-slate-600"
                      )}>
                        {activity.action_type === 'STATUS_ROLLBACK' ? (
                          <span className="text-red-600 font-bold">Vetoed: </span>
                        ) : null}
                        {activity.payload_change.description || `Performed ${activity.action_type.toLowerCase().replace('_', ' ')}`}
                      </p>

                      {/* Attachment Preview */}
                      {activity.action_type === 'ASSET_UPLOAD' && activity.asset_name && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-50 p-2 border border-zinc-100 group-hover:border-gold/30 transition-colors">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-white shadow-sm">
                            <FileText className="h-3 w-3 text-gold" />
                          </div>
                          <span className="text-[10px] font-bold text-navy truncate max-w-[180px]">
                            {activity.asset_name}
                          </span>
                        </div>
                      )}

                      {/* Veto Reason */}
                      {activity.action_type === 'STATUS_ROLLBACK' && activity.payload_change.reason && (
                        <div className="mt-2 text-[10px] italic text-red-500 font-medium border-l-2 border-red-200 pl-2">
                          "{activity.payload_change.reason}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="px-6 py-4 border-t border-zinc-100 bg-white/40">
        <p className="text-[9px] font-black text-slate uppercase tracking-[0.2em] text-center">
          Monitoring Real-time Activity
        </p>
      </div>
    </div>
  );
};
