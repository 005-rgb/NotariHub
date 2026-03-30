import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Type,
  Calendar,
  Tag,
  FileText,
  Send,
  Loader2,
  Megaphone,
} from 'lucide-react';

export type AnnouncementCategory = 'Urgent' | 'Informasi' | 'Perintah' | 'Jadwal';

export interface NewAnnouncementPayload {
  title: string;
  content: string;
  category: AnnouncementCategory;
  posted_at: string;
}

interface AnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (payload: NewAnnouncementPayload) => void;
  authorName: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const CATEGORIES: AnnouncementCategory[] = ['Urgent', 'Informasi', 'Perintah', 'Jadwal'];

const CATEGORY_STYLES: Record<AnnouncementCategory, string> = {
  Urgent: 'text-red-600 bg-red-50',
  Informasi: 'text-blue-600 bg-blue-50',
  Perintah: 'text-navy bg-zinc-100',
  Jadwal: 'text-emerald-600 bg-emerald-50',
};

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  isOpen,
  onClose,
  onPublish,
  authorName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Informasi' as AnnouncementCategory,
    date: today(),
    content: '',
  });

  useEffect(() => {
    if (isOpen) {
      setForm({ title: '', category: 'Informasi', date: today(), content: '' });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onPublish({
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        posted_at: new Date(form.date).toISOString(),
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium text-navy ' +
    'placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold ' +
    'transition-all bg-white';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative w-full max-w-[680px] bg-white rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Megaphone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h2
                    className="font-black text-navy uppercase tracking-tight"
                    style={{ fontSize: 14 }}
                  >
                    Buat Pengumuman Baru
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Bulletin Board — Easy Notaris
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-200 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Judul */}
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-tight">
                    <Type className="h-3.5 w-3.5 text-gold" />
                    Judul Pengumuman
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Perubahan SOP Kuartal II 2026"
                    value={form.title}
                    onChange={set('title')}
                    required
                    className={inputClass}
                    style={{ fontSize: 12 }}
                  />
                </div>

                {/* Tanggal */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-tight">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    Tanggal Posting
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={set('date')}
                    required
                    className={inputClass}
                    style={{ fontSize: 12 }}
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-tight">
                    <Tag className="h-3.5 w-3.5 text-gold" />
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={set('category')}
                      className={inputClass + ' appearance-none cursor-pointer pr-10'}
                      style={{ fontSize: 12 }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-black uppercase pointer-events-none ${CATEGORY_STYLES[form.category]}`}
                    >
                      {form.category}
                    </div>
                  </div>
                </div>

                {/* Materi / Berita */}
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-tight">
                    <FileText className="h-3.5 w-3.5 text-gold" />
                    Materi / Berita
                  </label>
                  <textarea
                    placeholder="Tuliskan isi pengumuman secara lengkap di sini..."
                    value={form.content}
                    onChange={set('content')}
                    required
                    rows={5}
                    className={inputClass + ' resize-none leading-relaxed'}
                    style={{ fontSize: 12, minHeight: '120px' }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Penulis:{' '}
                  <span className="text-navy">{authorName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 hover:border-zinc-400 transition-all"
                    style={{ fontSize: 12 }}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gold hover:bg-[#B19251] text-navy font-black text-[10px] uppercase tracking-widest px-7 py-2.5 rounded-xl shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                    style={{ fontSize: 12 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Publikasikan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
