import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Megaphone } from 'lucide-react';

export interface BulletinAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  posted_at: string;
}

interface BulletinDetailModalProps {
  announcement: BulletinAnnouncement | null;
  onClose: () => void;
}

export const BulletinDetailModal: React.FC<BulletinDetailModalProps> = ({ announcement, onClose }) => {
  return (
    <AnimatePresence>
      {announcement && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative w-full max-w-[600px] bg-white rounded-[28px] shadow-2xl overflow-hidden ring-1 ring-zinc-100"
          >
            <div className="flex items-start justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Bulletin Board
                  </p>
                  <h2 className="text-sm font-black text-navy uppercase tracking-tight leading-snug mt-0.5">
                    {announcement.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-200 text-slate-400 transition-colors shrink-0 ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-gold" />
                  {new Date(announcement.posted_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {announcement.author}
                </span>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                  {announcement.content}
                </p>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-navy text-white text-[10px] font-black uppercase tracking-widest hover:bg-navy/80 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
