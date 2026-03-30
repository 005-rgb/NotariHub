import React, { useState, useMemo, useEffect } from 'react';
import {
  Megaphone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BulletinDetailModal, BulletinAnnouncement } from './BulletinDetailModal';
import { AnnouncementForm, NewAnnouncementPayload } from './AnnouncementForm';

const ITEMS_PER_PAGE = 4;

const INITIAL_ANNOUNCEMENTS: BulletinAnnouncement[] = [
  {
    id: 'bul-1',
    title: 'Perubahan Tarif BPHTB Efektif Mei 2026',
    content:
      'Diberitahukan kepada seluruh staf dan konsumen bahwa terdapat perubahan tarif Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB) yang berlaku efektif mulai 1 Mei 2026.\n\nPerubahan ini ditetapkan berdasarkan Peraturan Daerah Nomor 12 Tahun 2026 dan berdampak pada seluruh transaksi jual beli properti di wilayah DKI Jakarta. Harap sesuaikan perhitungan biaya klien.\n\nUntuk informasi lebih lanjut, hubungi bagian administrasi.',
    author: 'Notaris Siti Aminah',
    posted_at: '2026-03-28T09:00:00Z',
  },
  {
    id: 'bul-2',
    title: 'Pemeliharaan Sistem — Sabtu 4 April 2026',
    content:
      'Sistem Easy Notaris akan mengalami pemeliharaan terjadwal pada hari Sabtu, 4 April 2026 pukul 00.00 – 04.00 WIB.\n\nSelama periode ini, akses ke aplikasi akan terbatas. Harap selesaikan semua entri data sebelum waktu pemeliharaan. Terima kasih atas pengertiannya.',
    author: 'Tim Teknis',
    posted_at: '2026-03-25T14:30:00Z',
  },
  {
    id: 'bul-3',
    title: 'Reminder: Batas Upload Dokumen Kuartal I',
    content:
      'Mengingatkan seluruh staf bahwa batas akhir upload dokumen untuk kuartal pertama 2026 adalah tanggal 31 Maret 2026.\n\nPastikan seluruh berkas klien yang sedang berjalan telah dilengkapi dokumen pendukungnya sebelum batas waktu tersebut. Berkas yang belum lengkap akan dikenai status "Pending Review".',
    author: 'Staf Utama Budi',
    posted_at: '2026-03-22T10:15:00Z',
  },
  {
    id: 'bul-4',
    title: 'Pelatihan Sistem AI OCR — Internal',
    content:
      'Akan diadakan sesi pelatihan penggunaan fitur AI OCR untuk ekstraksi data KTP dan Sertifikat Tanah pada:\n\nHari/Tanggal: Rabu, 8 April 2026\nWaktu: 13.00 – 15.00 WIB\nLokasi: Ruang Rapat Lantai 3\n\nKehadiran seluruh staf wajib. Siapkan 2–3 dokumen sampel untuk sesi praktik langsung.',
    author: 'Notaris Siti Aminah',
    posted_at: '2026-03-20T08:45:00Z',
  },
  {
    id: 'bul-5',
    title: 'Kebijakan Baru: Verifikasi Ganda untuk Akta Waris',
    content:
      'Sesuai arahan Dewan Kehormatan Notaris, mulai 1 April 2026 setiap Akta Keterangan Waris wajib melalui proses verifikasi ganda oleh minimal dua orang staf senior sebelum ditandatangani.\n\nProsedur lengkap telah diperbarui dalam SOP Internal rev. 3.1 yang tersedia di folder bersama.',
    author: 'Notaris Siti Aminah',
    posted_at: '2026-03-18T11:00:00Z',
  },
  {
    id: 'bul-6',
    title: 'Libur Nasional: Jadwal Operasional April 2026',
    content:
      'Sehubungan dengan libur nasional dan cuti bersama bulan April 2026, jadwal operasional kantor adalah sebagai berikut:\n\n• 14 April 2026 (Jumat Agung) — TUTUP\n• 18 April 2026 (Sabtu Paskah) — TUTUP\n\nKlien yang memiliki janji temu pada tanggal tersebut akan dihubungi untuk penjadwalan ulang.',
    author: 'Administrasi',
    posted_at: '2026-03-15T07:30:00Z',
  },
  {
    id: 'bul-7',
    title: 'Update Template WhatsApp Notifikasi Klien',
    content:
      'Template pesan WhatsApp untuk notifikasi status berkas klien telah diperbarui sesuai panduan branding terbaru.\n\nTemplate baru telah aktif di sistem. Harap gunakan fitur "Preview Template" sebelum mengirim pesan massal. Laporan ke admin jika ditemukan format yang tidak sesuai.',
    author: 'Tim Teknis',
    posted_at: '2026-03-12T15:00:00Z',
  },
  {
    id: 'bul-8',
    title: 'Rapat Bulanan Staf — 2 April 2026',
    content:
      'Rapat bulanan seluruh staf akan dilaksanakan pada:\n\nHari/Tanggal: Kamis, 2 April 2026\nWaktu: 09.00 – 10.30 WIB\nAgenda: Evaluasi kinerja Q1, target Q2, dan pembahasan SOP terbaru.\n\nAbsensi wajib. Staf yang berhalangan hadir wajib memberitahu atasan paling lambat H-1.',
    author: 'Notaris Siti Aminah',
    posted_at: '2026-03-10T09:00:00Z',
  },
];

interface BulletinBoardProps {
  role: string;
  authorName?: string;
}

export const BulletinBoard: React.FC<BulletinBoardProps> = ({
  role,
  authorName = 'Notaris',
}) => {
  const [announcements, setAnnouncements] = useState<BulletinAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [page, setPage] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<BulletinAnnouncement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState<string | null>(null);

  const isNotaris = role === 'NOTARIS';
  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(
    () => announcements.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE),
    [announcements, page]
  );

  useEffect(() => {
    if (!successTitle) return;
    const t = setTimeout(() => setSuccessTitle(null), 3500);
    return () => clearTimeout(t);
  }, [successTitle]);

  const handlePublish = (payload: NewAnnouncementPayload) => {
    const newEntry: BulletinAnnouncement = {
      id: `bul-${Date.now()}`,
      title: payload.title,
      content: payload.content,
      author: authorName,
      posted_at: payload.posted_at,
    };
    setAnnouncements((prev) => [newEntry, ...prev]);
    setPage(0);
    setSuccessTitle(newEntry.title);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const excerpt = (text: string) =>
    text.length > 60 ? text.slice(0, 60).trimEnd() + '...' : text;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gold/10 flex items-center justify-center">
              <Megaphone className="h-3.5 w-3.5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-navy uppercase tracking-tight">Bulletin Board</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Pengumuman Internal Kantor
              </p>
            </div>
          </div>

          {isNotaris && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-1.5 bg-navy hover:bg-navy/80 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Buat Pengumuman
            </button>
          )}
        </div>

        {/* Success Toast */}
        {successTitle && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Pengumuman Berhasil Dipublikasikan
              </p>
              <p className="text-xs font-medium text-emerald-600 mt-0.5 truncate max-w-sm">
                "{successTitle}"
              </p>
            </div>
          </div>
        )}

        {/* Card Grid 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gold/20 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                  <FileText className="h-4 w-4 text-slate-400 group-hover:text-gold transition-colors" />
                </div>
                <div className="min-w-0">
                  <button
                    onClick={() => setSelectedAnnouncement(item)}
                    className={cn(
                      'text-left text-xs font-black text-navy uppercase tracking-tight leading-snug',
                      'hover:underline decoration-gold underline-offset-2 transition-all'
                    )}
                    style={{ fontSize: 12 }}
                  >
                    {item.title}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed mb-3 pl-11">
                {excerpt(item.content)}
              </p>

              <div className="flex items-center gap-1.5 pl-11">
                <Calendar style={{ width: 10, height: 10 }} className="text-gold shrink-0" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {formatDate(item.posted_at)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Halaman {page + 1} dari {totalPages} &mdash; {announcements.length} Pengumuman
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={cn(
                    'h-6 w-6 rounded-md text-[9px] font-black transition-all',
                    i === page ? 'bg-navy text-white' : 'text-slate-400 hover:bg-zinc-100'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <BulletinDetailModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />

      {/* Create Form Modal — RBAC guard: only renders for NOTARIS */}
      {isNotaris && (
        <AnnouncementForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onPublish={handlePublish}
          authorName={authorName}
        />
      )}
    </>
  );
};
