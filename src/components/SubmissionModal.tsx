import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  CreditCard, 
  Phone, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Shield, 
  Send, 
  Loader2 
} from 'lucide-react';
import { GroupedKatalogSelect, KatalogOption } from './GroupedKatalogSelect';
import { SubmissionSuccessModal } from './SubmissionSuccessModal';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, profile }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    no_wa: '',
    biaya: '',
    durasi: '',
  });
  const [selectedKatalog, setSelectedKatalog] = useState<KatalogOption | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nama: '',
        nik: '',
        no_wa: '',
        biaya: '',
        durasi: '',
      });
      setSelectedKatalog(null);
    }
  }, [isOpen]);

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseInt(number));
  };

  const handleBiayaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, biaya: rawValue });
  };

  const generateKodeAjuan = (prefix: string) => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}${year}${month}${sequence}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKatalog) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const result = {
        nama: formData.nama,
        nik: formData.nik,
        no_wa: formData.no_wa,
        rumpun: selectedKatalog.rumpun,
        katalog: selectedKatalog.label,
        kode_ajuan: generateKodeAjuan(selectedKatalog.prefix),
        notaris_name: 'Siti Aminah, S.H., M.Kn.',
        biaya: formData.biaya ? formatCurrency(formData.biaya) : 'N/A',
        durasi: formData.durasi ? `${formData.durasi} Hari` : 'N/A',
        petugas: profile?.username || 'System',
      };
      
      setSubmissionResult(result);
      setIsSubmitting(false);
      onClose();
      setIsSuccessOpen(true);
    }, 1500);
  };

  return (
    <>
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

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[700px] bg-white rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100">
                <div>
                  <h2 className="text-xl font-black text-navy uppercase tracking-tight">Input Ajuan Baru</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Easy Notaris Management System v1.0
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-100 text-slate-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                      <User className="h-4 w-4 text-gold" />
                      Nama Konsumen
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Budi Santoso"
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all outline-none"
                      required
                    />
                  </div>

                  {/* NIK */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gold" />
                      NIK (16 Digit)
                    </label>
                    <input 
                      type="text" 
                      placeholder="331201..."
                      maxLength={16}
                      value={formData.nik}
                      onChange={(e) => setFormData({...formData, nik: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all outline-none"
                      required
                    />
                  </div>

                  {/* No WA */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gold" />
                      Nomor WhatsApp
                    </label>
                    <input 
                      type="text" 
                      placeholder="0812..."
                      value={formData.no_wa}
                      onChange={(e) => setFormData({...formData, no_wa: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all outline-none"
                      required
                    />
                  </div>

                  {/* Katalog */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gold" />
                      Layanan / Katalog
                    </label>
                    <GroupedKatalogSelect 
                      value={selectedKatalog}
                      onChange={setSelectedKatalog}
                    />
                  </div>

                  {/* Estimasi Biaya */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gold" />
                      Estimasi Biaya (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input 
                        type="text" 
                        placeholder="0"
                        value={formData.biaya ? parseInt(formData.biaya).toLocaleString('id-ID') : ''}
                        onChange={handleBiayaChange}
                        className="w-full pl-10 pr-5 py-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Durasi */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gold" />
                      Durasi Pengerjaan (Optional)
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.durasi}
                        onChange={(e) => setFormData({...formData, durasi: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Hari</span>
                    </div>
                  </div>
                </div>

                {/* Footer / Audit Trail */}
                <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Shield className="h-3 w-3 text-gold" />
                    <span>Petugas Pemroses: <span className="text-navy">{profile?.username || 'System'}</span></span>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !selectedKatalog}
                    className="flex items-center gap-3 bg-gold hover:bg-[#B19251] text-navy font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Simpan Ajuan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SubmissionSuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
        data={submissionResult} 
      />
    </>
  );
};
