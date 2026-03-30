import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Paperclip,
  ChevronDown,
  Pencil,
  Trash2,
  Check,
  X as XIcon,
  User,
  Phone,
  CreditCard,
  Tag,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { FolderListItem, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ConsumerProfilePageProps {
  profile: UserProfile | null;
}

/* ─── Catalog Steps ─────────────────────────────────────────────────── */
const CATALOG_STEPS: Record<string, string[]> = {
  AJB: [
    'Penerimaan Berkas',
    'Verifikasi Identitas Pihak',
    'Pengecekan Sertifikat Tanah',
    'Validasi Pajak (BPHTB & PPH)',
    'Pembuatan Draf AJB',
    'Pembacaan Akta di Hadapan Notaris',
    'Penandatanganan Akta',
    'Penyerahan Salinan Akta',
  ],
  APHT: [
    'Penerimaan Berkas',
    'Pengecekan Sertifikat Tanah',
    'Verifikasi Data Debitur & Kreditur',
    'Validasi Perjanjian Kredit',
    'Pembuatan Draf APHT',
    'Penandatanganan APHT',
    'Pendaftaran ke BPN',
    'Penyerahan Sertipikat HT',
  ],
  SKMHT: [
    'Penerimaan Berkas',
    'Verifikasi Identitas Pemberi Kuasa',
    'Pembuatan Draf SKMHT',
    'Pembacaan Akta',
    'Penandatanganan SKMHT',
    'Legalisasi Dokumen',
    'Penyerahan Salinan Resmi',
  ],
  FIDUSIA: [
    'Penerimaan Berkas',
    'Verifikasi Data Debitur',
    'Identifikasi Objek Fidusia',
    'Pembuatan Draf Akta Fidusia',
    'Penandatanganan Akta',
    'Pendaftaran Fidusia Online (AHU)',
    'Sertifikat Fidusia Diterima',
    'Penyerahan Dokumen ke Kreditur',
  ],
  WASIAT: [
    'Penerimaan Berkas',
    'Verifikasi Identitas Pewasiat',
    'Konsultasi Isi Wasiat',
    'Pembuatan Draf Akta Wasiat',
    'Pembacaan Akta',
    'Penandatanganan Akta Wasiat',
    'Penyimpanan Minuta Akta',
    'Pendaftaran Wasiat (Opsional)',
  ],
};

const DEFAULT_STEPS = [
  'Penerimaan Berkas',
  'Verifikasi Dokumen',
  'Proses Administrasi',
  'Validasi Internal',
  'Penandatanganan',
  'Penyelesaian',
];

/* ─── Mock Data Generators ──────────────────────────────────────────── */
const STEP_NOTES = [
  'Berkas diterima lengkap. Nomor urut registrasi telah ditetapkan.',
  'Identitas para pihak telah terverifikasi sesuai data kependudukan nasional.',
  'Sertifikat asli telah dicek, valid, dan tidak dalam sengketa.',
  'Nilai BPHTB dan PPH telah terkonfirmasi sesuai NJOP yang berlaku.',
  'Draf akta telah disetujui oleh seluruh pihak yang bersangkutan.',
  'Akta dibacakan secara lengkap di hadapan para pihak dan saksi.',
  'Seluruh pihak telah menandatangani akta di hadapan Notaris.',
  'Salinan akta resmi diserahkan kepada seluruh pihak yang berhak.',
];

const STEP_ATTACHMENTS = [
  ['KTP_Pembeli.pdf', 'KTP_Penjual.pdf'],
  ['BPJS_Kependudukan.pdf', 'KK_Pembeli.pdf'],
  ['Sertifikat_Tanah.pdf', 'SHGB_Asli.pdf', 'IMB.pdf'],
  ['BPHTB_Setoran.pdf', 'PPH_Final.pdf'],
  ['Draf_AJB_Rev1.pdf'],
  ['BA_Pembacaan.pdf', 'Checklist_Hadir.pdf'],
  ['Akta_TTD_Scan.pdf'],
  ['Salinan_Akta.pdf', 'Tanda_Terima.pdf'],
];

function getMockNote(stepIdx: number, status: 'completed' | 'current' | 'pending'): string {
  if (status === 'pending') return '';
  return STEP_NOTES[stepIdx % STEP_NOTES.length];
}

function getMockAttachments(stepIdx: number, status: 'completed' | 'current' | 'pending'): string[] {
  if (status === 'pending') return [];
  if (status === 'current') return [STEP_ATTACHMENTS[stepIdx % STEP_ATTACHMENTS.length][0]];
  return STEP_ATTACHMENTS[stepIdx % STEP_ATTACHMENTS.length];
}

function getMockTimestamp(createdAt: string, stepIdx: number): string {
  const base = new Date(createdAt).getTime();
  const offset = stepIdx * 2 * 24 * 60 * 60 * 1000;
  return new Date(base + offset).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ─── Step Status Helpers ────────────────────────────────────────────── */
function getStepStatus(
  stepIdx: number,
  totalSteps: number,
  progressPct: number,
): 'completed' | 'current' | 'pending' {
  const completedCount = Math.round((progressPct / 100) * totalSteps);
  if (stepIdx < completedCount) return 'completed';
  if (stepIdx === completedCount && completedCount < totalSteps) return 'current';
  return 'pending';
}

function getStatusBoxGradient(
  stepIdx: number,
  totalSteps: number,
  status: 'completed' | 'current' | 'pending',
): string {
  if (status === 'pending') return 'from-zinc-50 to-zinc-100 border-zinc-200';
  const position = stepIdx / Math.max(totalSteps - 1, 1);
  if (status === 'current') {
    if (position < 0.33) return 'from-amber-100 to-orange-50 border-amber-200';
    if (position < 0.67) return 'from-blue-100 to-sky-50 border-blue-200';
    return 'from-emerald-100 to-teal-50 border-emerald-200';
  }
  // completed
  if (position < 0.33) return 'from-orange-50 to-slate-50 border-orange-100';
  if (position < 0.67) return 'from-blue-50 to-slate-50 border-blue-100';
  return 'from-emerald-50 to-zinc-50 border-emerald-100';
}

function getStatusTextColor(
  stepIdx: number,
  totalSteps: number,
  status: 'completed' | 'current' | 'pending',
): string {
  if (status === 'pending') return 'text-zinc-400';
  const position = stepIdx / Math.max(totalSteps - 1, 1);
  if (status === 'current') {
    if (position < 0.33) return 'text-amber-800';
    if (position < 0.67) return 'text-blue-800';
    return 'text-emerald-800';
  }
  if (position < 0.33) return 'text-orange-700';
  if (position < 0.67) return 'text-blue-700';
  return 'text-emerald-700';
}

/* ─── Identity Field Row ─────────────────────────────────────────────── */
const FieldRow: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({
  icon, label, value, mono,
}) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={cn('text-xs font-bold text-navy mt-0.5 break-all', mono && 'font-mono')}>{value}</p>
    </div>
  </div>
);

/* ─── Skeleton ───────────────────────────────────────────────────────── */
const SkeletonProfile: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 rounded-xl bg-zinc-100" />
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      {[160, 220, 180, 140].map((w, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100">
          <div className="h-4 w-4 rounded-full bg-zinc-100 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 w-16 rounded-full bg-zinc-100" />
            <div className="h-3 rounded-full bg-zinc-100" style={{ width: w }} />
          </div>
        </div>
      ))}
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="flex gap-4">
        <div className="h-20 w-40 rounded-xl bg-zinc-100 shrink-0" />
        <div className="flex-1 h-20 rounded-xl bg-zinc-100" />
        <div className="h-20 w-44 rounded-xl bg-zinc-100 shrink-0" />
      </div>
    ))}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
export const ConsumerProfilePage: React.FC<ConsumerProfilePageProps> = ({ profile }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consumer, setConsumer] = useState<FolderListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deletedSteps, setDeletedSteps] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const isNotaris = profile?.role === 'NOTARIS';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    NotaryHttpClient.get(`/api/consumers/${id}`)
      .then(async (res) => {
        if (!res.ok) { setNotFound(true); return; }
        const data: FolderListItem = await res.json();
        setConsumer(data);
        // Pre-populate notes from mock
        const steps = CATALOG_STEPS[data.catalog_code] || DEFAULT_STEPS;
        const total = steps.length;
        const initialNotes: Record<number, string> = {};
        steps.forEach((_, idx) => {
          const status = getStepStatus(idx, total, data.progress_pct);
          const note = getMockNote(idx, status);
          if (note) initialNotes[idx] = note;
        });
        setNotes(initialNotes);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartEdit = useCallback((stepIdx: number, currentNote: string) => {
    setEditingStep(stepIdx);
    setEditDraft(currentNote);
  }, []);

  const handleSaveEdit = useCallback((stepIdx: number) => {
    setNotes(prev => ({ ...prev, [stepIdx]: editDraft }));
    setEditingStep(null);
    setEditDraft('');
  }, [editDraft]);

  const handleCancelEdit = useCallback(() => {
    setEditingStep(null);
    setEditDraft('');
  }, []);

  const handleDeleteStep = useCallback((stepIdx: number) => {
    setDeletedSteps(prev => new Set([...prev, stepIdx]));
    setConfirmDelete(null);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-2">
        <SkeletonProfile />
      </div>
    );
  }

  if (notFound || !consumer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-bold text-navy">Konsumen tidak ditemukan.</p>
        <button
          onClick={() => navigate('/consumers')}
          className="text-xs font-bold text-gold hover:underline"
        >
          ← Kembali ke Direktori
        </button>
      </div>
    );
  }

  const steps = CATALOG_STEPS[consumer.catalog_code] || DEFAULT_STEPS;
  const totalSteps = steps.length;
  const shortId = consumer.id.replace('uuid-', '').toUpperCase();
  const dateStr = new Date(consumer.created_at).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/consumers')}
          className="flex items-center gap-2 text-xs font-bold text-gold border border-gold/40 rounded-xl px-4 py-2 hover:bg-gold/5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Direktori
        </button>

        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Petugas: <span className="text-navy">{profile?.username || 'System'}</span></span>
          <span className="text-gold">•</span>
          <span className={cn(
            'px-2 py-0.5 rounded-md',
            isNotaris ? 'bg-gold/10 text-gold' : 'bg-zinc-100 text-slate-500'
          )}>
            {profile?.role || 'GUEST'}
          </span>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="h-8 w-8 rounded-xl bg-gold/10 flex items-center justify-center">
            <User className="h-4 w-4 text-gold" />
          </div>
          <div>
            <h2 className="text-sm font-black text-navy uppercase tracking-tight">Identitas Konsumen</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Kode Ajuan: #{shortId}
            </p>
          </div>
          {consumer.is_vetoed && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-1 uppercase tracking-wide">
              <AlertTriangle className="h-3 w-3" /> Revisi Diperlukan
            </span>
          )}
        </div>
        <div className="px-6 py-2 grid grid-cols-2 divide-x divide-slate-100">
          <div className="pr-6">
            <FieldRow icon={<User className="h-3.5 w-3.5" />} label="Nama Lengkap" value={consumer.client_name} />
            <FieldRow icon={<CreditCard className="h-3.5 w-3.5" />} label="Nomor NIK" value={consumer.nik || '—'} mono />
            <FieldRow icon={<Phone className="h-3.5 w-3.5" />} label="Nomor HP / WA" value={consumer.phone || '—'} mono />
          </div>
          <div className="pl-6">
            <FieldRow icon={<Tag className="h-3.5 w-3.5" />} label="Jenis Katalog" value={consumer.catalog_code} />
            <FieldRow icon={<Calendar className="h-3.5 w-3.5" />} label="Tanggal Masuk" value={dateStr} />
            <FieldRow
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Progres Saat Ini"
              value={`${consumer.progress_pct}% — ${consumer.current_milestone}`}
            />
          </div>
        </div>
      </div>

      {/* Progress Section Header */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">
          Alur Proses — {consumer.catalog_code} ({totalSteps} Tahapan)
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Vertical Steps */}
      <div className="space-y-0">
        {steps.map((stepLabel, idx) => {
          if (deletedSteps.has(idx)) return null;

          const status = getStepStatus(idx, totalSteps, consumer.progress_pct);
          const gradient = getStatusBoxGradient(idx, totalSteps, status);
          const textColor = getStatusTextColor(idx, totalSteps, status);
          const timestamp = status !== 'pending' ? getMockTimestamp(consumer.created_at, idx) : null;
          const attachments = getMockAttachments(idx, status);
          const noteText = notes[idx] ?? '';
          const isEditing = editingStep === idx;

          const isLast = idx === steps.length - 1 || steps.slice(idx + 1).every((_, i) => deletedSteps.has(idx + 1 + i));

          return (
            <div key={idx}>
              {/* Step Row */}
              <div className="flex gap-3 items-start group/row">

                {/* LEFT: Status Box */}
                <div className="shrink-0" style={{ width: 168 }}>
                  <div className={cn(
                    'rounded-xl border bg-gradient-to-br px-3 py-2.5',
                    gradient,
                    status === 'current' && 'ring-2 ring-offset-1',
                    status === 'current' && idx / (totalSteps - 1) < 0.33 ? 'ring-amber-300' :
                    status === 'current' && idx / (totalSteps - 1) < 0.67 ? 'ring-blue-300' :
                    status === 'current' ? 'ring-emerald-300' : '',
                  )}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest', textColor, 'opacity-70')}>
                        Step {idx + 1}
                      </span>
                      {status === 'completed' && (
                        <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      )}
                      {status === 'current' && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className={cn('text-xs font-bold leading-tight', textColor)}>{stepLabel}</p>
                    {timestamp && (
                      <p className={cn('text-[10px] mt-1.5 font-medium opacity-60', textColor)}>
                        {timestamp}
                      </p>
                    )}
                    {status === 'pending' && (
                      <p className="text-[10px] mt-1 font-medium text-zinc-400 italic">Belum dimulai</p>
                    )}
                  </div>
                </div>

                {/* MIDDLE: Notes Box */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="rounded-xl border border-gold/40 bg-white shadow-sm overflow-hidden">
                      <textarea
                        value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs text-navy font-medium resize-none focus:outline-none"
                        rows={3}
                        placeholder="Tambahkan catatan untuk tahap ini..."
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-gold/20 bg-gold/5">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-navy transition-colors px-2 py-1 rounded"
                        >
                          <XIcon className="h-3 w-3" /> Batal
                        </button>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="flex items-center gap-1 text-[10px] font-black text-white bg-gold rounded-lg px-3 py-1.5 hover:bg-gold/90 transition-colors"
                        >
                          <Check className="h-3 w-3" /> Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'rounded-xl border border-slate-200 bg-white px-3 py-2.5 min-h-[64px] transition-all',
                        isNotaris && status !== 'pending' && 'hover:border-gold/40 hover:shadow-sm cursor-pointer',
                        status === 'pending' && 'opacity-40',
                      )}
                      onClick={() => {
                        if (isNotaris && status !== 'pending') handleStartEdit(idx, noteText);
                      }}
                      title={isNotaris && status !== 'pending' ? 'Klik untuk edit catatan' : undefined}
                    >
                      {noteText ? (
                        <p className="text-xs text-slate-700 leading-relaxed">{noteText}</p>
                      ) : status !== 'pending' ? (
                        <p className="text-xs text-slate-400 italic">
                          {isNotaris ? 'Klik untuk tambah catatan...' : 'Belum ada catatan.'}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-300 italic">Tahap belum dimulai.</p>
                      )}
                      {isNotaris && status !== 'pending' && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <Pencil className="h-2.5 w-2.5" />
                          <span>Edit Catatan</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT: Attachments Box */}
                <div className="shrink-0" style={{ width: 176 }}>
                  <div className={cn(
                    'rounded-xl border border-slate-200 bg-white px-3 py-2.5 min-h-[64px]',
                    status === 'pending' && 'opacity-40',
                  )}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Lampiran
                    </p>
                    {attachments.length > 0 ? (
                      <div className="space-y-1.5">
                        {attachments.map((att, aIdx) => (
                          <a
                            key={aIdx}
                            href="#"
                            onClick={e => e.preventDefault()}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            <Paperclip className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{att}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-300 italic">—</p>
                    )}
                  </div>
                </div>

                {/* FAR RIGHT: Delete action (NOTARIS only) */}
                <div className="shrink-0 flex items-start pt-2" style={{ width: 110 }}>
                  {isNotaris && (
                    confirmDelete === idx ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-red-600">Konfirmasi?</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeleteStep(idx)}
                            className="text-[10px] font-black text-white bg-red-500 rounded px-2 py-1 hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-[10px] font-bold text-slate-500 hover:text-navy px-1 py-1"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(idx)}
                        className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 opacity-0 group-hover/row:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus Proses
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Connector Arrow (between steps) */}
              {!isLast && (
                <div className="flex items-center" style={{ paddingLeft: 68, height: 28 }}>
                  <div className="flex flex-col items-center text-slate-300">
                    <div className="w-px h-4 bg-slate-200" />
                    <ChevronDown className="h-4 w-4 -mt-1 text-slate-300" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
        {isNotaris ? (
          <>
            <Pencil className="h-3 w-3 text-gold" />
            <span>Mode Notaris — Catatan dapat diedit. Klik pada box catatan untuk memulai.</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>Mode Staf — Tampilan hanya baca (read-only).</span>
          </>
        )}
      </div>
    </div>
  );
};
