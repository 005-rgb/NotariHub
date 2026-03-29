import React, { useState } from 'react';
import { SubmissionSuccessModal } from './SubmissionSuccessModal';
import { GroupedKatalogSelect, KatalogOption } from './GroupedKatalogSelect';
import { FileText, User, CreditCard, Phone, Layers, Briefcase, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const NewSubmissionForm: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: 'Budi Santoso',
    nik: '3312012345678901',
    no_wa: '081234567890',
  });
  const [selectedKatalog, setSelectedKatalog] = useState<KatalogOption | null>(null);

  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKatalog) {
      alert('Silakan pilih Katalog Layanan terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const result = {
        ...formData,
        rumpun: selectedKatalog.rumpun,
        katalog: selectedKatalog.label,
        kode_ajuan: `${selectedKatalog.prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        notaris_name: 'Siti Aminah, S.H., M.Kn.',
      };
      setSubmissionResult(result);
      setIsSubmitting(false);
      setIsModalOpen(true);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card rounded-[32px] p-12 ring-1 ring-gold/10">
        <div className="mb-12">
          <h2 className="text-xl font-black text-navy uppercase tracking-tight">Form Ajuan Baru</h2>
          <p className="mt-2 text-sm font-medium text-slate">Lengkapi data di bawah ini untuk memulai proses pembuatan akta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nama */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                <User className="h-4 w-4 text-gold" />
                Nama Lengkap
              </label>
              <input 
                type="text" 
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
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
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                maxLength={16}
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
                value={formData.no_wa}
                onChange={(e) => setFormData({...formData, no_wa: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                required
              />
            </div>

            {/* Katalog */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-navy uppercase tracking-tight flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold" />
                Katalog Layanan
              </label>
              <GroupedKatalogSelect 
                value={selectedKatalog}
                onChange={setSelectedKatalog}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-navy hover:bg-[#1E293B] text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Kirim Ajuan</span>
              </>
            )}
          </button>
        </form>
      </div>

      <SubmissionSuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={submissionResult} 
      />
    </div>
  );
};
