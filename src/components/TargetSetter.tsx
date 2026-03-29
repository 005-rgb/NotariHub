import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';

interface TargetSetterProps {
  folderId: string;
  initialTargetDate?: string;
  isOverdue?: boolean;
  userRole: string;
  onUpdate: (newDate: string, isOverdue: boolean) => void;
}

export const TargetSetter: React.FC<TargetSetterProps> = ({
  folderId,
  initialTargetDate,
  isOverdue: initialIsOverdue,
  userRole,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const isNotary = userRole === 'NOTARIS';

  const setPresetTarget = async (days: number) => {
    if (!isNotary) return;
    
    setLoading(true);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    try {
      const res = await NotaryHttpClient.post(`/api/folders/${folderId}/target`, {
        target_date: targetDate.toISOString()
      });
      
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.target_completion_date, data.is_overdue);
      }
    } catch (err) {
      console.error('Failed to set target:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft(initialTargetDate);
  const isOverdue = initialIsOverdue || (daysLeft !== null && daysLeft < 0);

  return (
    <div className="glass-card rounded-2xl p-6 ring-1 ring-gold/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500",
          isOverdue ? "bg-red-100 text-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-navy text-gold"
        )}>
          {isOverdue ? <AlertTriangle className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate">Target Timeline</h4>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-lg font-black tracking-tight uppercase",
              isOverdue ? "text-red-600" : "text-navy"
            )}>
              {initialTargetDate 
                ? `Estimasi Selesai: ${new Date(initialTargetDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : 'Target Belum Ditetapkan'}
            </span>
            {daysLeft !== null && (
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                isOverdue ? "bg-red-100 text-red-600" : "bg-gold/10 text-gold"
              )}>
                {isOverdue ? `${Math.abs(daysLeft)} Hari Terlambat` : `${daysLeft} Hari Lagi`}
              </span>
            )}
          </div>
        </div>
      </div>

      {isNotary && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate mr-2">Set Target:</span>
          {[3, 7, 14].map((days) => (
            <button
              key={days}
              onClick={() => setPresetTarget(days)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-navy transition-all hover:border-gold hover:text-gold disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : `+${days} Hari`}
            </button>
          ))}
          <button
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-zinc-800 gold-glow disabled:opacity-50"
          >
            <Calendar className="h-3 w-3 text-gold" />
            Custom
          </button>
        </div>
      )}
    </div>
  );
};
