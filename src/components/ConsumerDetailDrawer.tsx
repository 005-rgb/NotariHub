import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Download, 
  History, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  User,
  Tag,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, FolderListItem, FolderActivity } from '../types';

interface ConsumerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: FolderListItem | null;
  profile: UserProfile | null;
  onStatusUpdate?: (newStatus: string) => void;
}

// Mock Steps 1-43 for Notary
const MILESTONES = Array.from({ length: 43 }, (_, i) => `Step ${i + 1}: ${getStepLabel(i + 1)}`);

function getStepLabel(step: number) {
  const labels: Record<number, string> = {
    1: 'Penerimaan Berkas',
    2: 'Verifikasi NIK & Identitas',
    3: 'Pengecekan Sertifikat',
    5: 'Validasi Pajak (PPH/BPHTB)',
    10: 'Drafting Akta',
    20: 'Pembacaan & Penandatanganan',
    30: 'Pendaftaran ke Instansi',
    43: 'Penyerahan Salinan Akta',
  };
  return labels[step] || 'Proses Administrasi';
}

export const ConsumerDetailDrawer: React.FC<ConsumerDetailDrawerProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  profile,
  onStatusUpdate
}) => {
  const isNotaris = profile?.role === 'NOTARIS';
  const [currentStatus, setCurrentStatus] = useState(data?.current_milestone || '');

  if (!data) return null;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    if (onStatusUpdate) {
      onStatusUpdate(newStatus);
    }
    // Logic to send to Live Pulse would go here
    console.log(`[Live Pulse] Status updated to ${newStatus} by ${profile?.username}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-navy/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[120] w-full max-w-[500px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-20 border-b border-zinc-100 flex items-center justify-between px-8 shrink-0 bg-white">
              <div>
                <h2 className="text-sm font-bold text-navy uppercase tracking-tight">Detail Konsumen</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  ID Ajuan: {data.id.split('-')[0].toUpperCase()}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
              {/* Basic Info Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy uppercase tracking-tight">{data.client_name}</h3>
                    <p className="text-xs text-slate-500">{data.nik || 'NIK Belum Terdata'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Katalog</p>
                    <p className="text-xs font-bold text-navy mt-1">{data.catalog_code}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Masuk</p>
                    <p className="text-xs font-medium text-navy mt-1">
                      {new Date(data.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Status Section (RBAC) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold" />
                    Progres Status
                  </h3>
                  {isNotaris ? (
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest bg-gold/10 px-2 py-1 rounded-md">Editable</span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">Read Only</span>
                  )}
                </div>

                {isNotaris ? (
                  <div className="relative">
                    <select 
                      value={currentStatus}
                      onChange={handleStatusChange}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-navy focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none appearance-none cursor-pointer"
                    >
                      {MILESTONES.map((step) => (
                        <option key={step} value={step}>{step}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                ) : (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-navy">{data.current_milestone}</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                )}
              </section>

              {/* File Manager Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold" />
                  File Manager
                </h3>
                <div className="space-y-2">
                  {['KTP_Konsumen.pdf', 'Sertifikat_Tanah.pdf', 'PBB_2025.pdf'].map((file, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-gold/30 hover:bg-gold/5 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-white">
                          <FileText className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="text-xs font-medium text-navy">{file}</span>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-gold transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Logs / Audit Trail Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                  <History className="h-4 w-4 text-gold" />
                  Logs & Audit Trail
                </h3>
                <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-zinc-100">
                  {[
                    { user: 'Siti Aminah', action: 'Mengubah status ke Step 5', time: '2 jam yang lalu' },
                    { user: 'Budi Staf', action: 'Mengunggah file PBB_2025.pdf', time: '5 jam yang lalu' },
                    { user: 'System', action: 'Ajuan Baru Dibuat', time: '1 hari yang lalu' },
                  ].map((log, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-gold shadow-sm" />
                      <p className="text-xs font-bold text-navy">{log.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.user}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300" />
                        <span className="text-[10px] text-slate-400">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Notes Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gold" />
                  Internal Notes
                </h3>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                  <p className="text-xs text-amber-900 leading-relaxed italic">
                    "Harap perhatikan validasi BPHTB, pastikan nilai transaksi sesuai dengan NJOP terbaru."
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-[8px] font-black text-amber-700">SA</div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Siti Aminah</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Petugas Aktif: <span className="text-navy">{profile?.username || 'System'}</span></span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
