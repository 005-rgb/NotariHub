import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { cn } from '../lib/utils';

interface RollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
  targetMilestoneId: string;
  targetMilestoneName: string;
  onSuccess: () => void;
}

export const RollbackModal: React.FC<RollbackModalProps> = ({
  isOpen,
  onClose,
  folderId,
  folderName,
  targetMilestoneId,
  targetMilestoneName,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRollback = async () => {
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      const res = await NotaryHttpClient.post('/api/folders/revert-status', {
        folder_id: folderId,
        target_milestone_id: targetMilestoneId,
        reason_text: reason
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to rollback status');
      }
    } catch (err) {
      console.error('Rollback failed:', err);
      alert('Network error occurred during rollback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gold/20"
          >
            {/* Header */}
            <div className="premium-gradient px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold ring-1 ring-gold/50">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Veto Rollback</h3>
                </div>
                <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-xs font-medium text-amber-800 leading-relaxed">
                  You are about to revert <span className="font-black">"{folderName}"</span> back to 
                  <span className="font-black text-navy"> {targetMilestoneName}</span>. 
                  This action will be logged in the Black Box Audit.
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate mb-2 block">
                    Reason for Rollback (Mandatory)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., PPH validation failed, document mismatch..."
                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-4 text-sm font-medium text-navy placeholder:text-zinc-400 focus:border-gold focus:ring-gold transition-all min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-black uppercase tracking-widest text-slate hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRollback}
                    disabled={!reason.trim() || loading}
                    className="flex-1 rounded-xl bg-navy py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all gold-glow flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 text-gold" />
                        Confirm Veto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
