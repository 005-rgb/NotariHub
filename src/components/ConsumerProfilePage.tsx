import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Lock,
  LockOpen,
  Save,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { FolderListItem, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ConsumerProfilePageProps {
  profile: UserProfile | null;
}

type StepLockStatus = 'OPEN' | 'COMPLETED' | 'LOCKED';

/* ─── Attachment Types ───────────────────────────────────────────────── */
interface AttachFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'file';
  uploading?: boolean;
  progress?: number;
}

interface AttachLink {
  id: string;
  url: string;
  type: 'link';
}

type Attachment = AttachFile | AttachLink;

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILES = 2;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return <FileText className="h-3 w-3 shrink-0 text-red-500" />;
  return <ImageIcon className="h-3 w-3 shrink-0 text-emerald-500" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

/* ─── Mock Data ──────────────────────────────────────────────────────── */
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

const MOCK_ATTACHMENTS_DATA: Array<Array<{ name: string; mimeType: string; size: number }>> = [
  [{ name: 'KTP_Pembeli.pdf', mimeType: 'application/pdf', size: 312000 }, { name: 'KTP_Penjual.pdf', mimeType: 'application/pdf', size: 298000 }],
  [{ name: 'BPJS_Kependudukan.pdf', mimeType: 'application/pdf', size: 420000 }, { name: 'KK_Pembeli.jpg', mimeType: 'image/jpeg', size: 185000 }],
  [{ name: 'Sertifikat_Tanah.pdf', mimeType: 'application/pdf', size: 980000 }, { name: 'SHGB_Asli.pdf', mimeType: 'application/pdf', size: 760000 }],
  [{ name: 'BPHTB_Setoran.pdf', mimeType: 'application/pdf', size: 210000 }, { name: 'PPH_Final.pdf', mimeType: 'application/pdf', size: 195000 }],
  [{ name: 'Draf_AJB_Rev1.pdf', mimeType: 'application/pdf', size: 540000 }],
  [{ name: 'BA_Pembacaan.pdf', mimeType: 'application/pdf', size: 310000 }, { name: 'Checklist_Hadir.jpg', mimeType: 'image/jpeg', size: 92000 }],
  [{ name: 'Akta_TTD_Scan.pdf', mimeType: 'application/pdf', size: 670000 }],
  [{ name: 'Salinan_Akta.pdf', mimeType: 'application/pdf', size: 820000 }, { name: 'Tanda_Terima.png', mimeType: 'image/png', size: 130000 }],
];

function getMockNote(stepIdx: number, status: StepLockStatus): string {
  if (status === 'LOCKED') return '';
  return STEP_NOTES[stepIdx % STEP_NOTES.length];
}

function initMockAttachments(stepIdx: number, status: StepLockStatus): Attachment[] {
  if (status === 'LOCKED') return [];
  const pool = MOCK_ATTACHMENTS_DATA[stepIdx % MOCK_ATTACHMENTS_DATA.length];
  const files = status === 'COMPLETED' ? pool : pool.slice(0, 1);
  return files.map((f, i) => ({
    id: `mock-${stepIdx}-${i}`,
    name: f.name,
    size: f.size,
    mimeType: f.mimeType,
    type: 'file' as const,
  }));
}

function getMockTimestamp(createdAt: string, stepIdx: number): string {
  const base = new Date(createdAt).getTime();
  const offset = stepIdx * 2 * 24 * 60 * 60 * 1000;
  return new Date(base + offset).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Status Init ────────────────────────────────────────────────────── */
function initStepStatuses(steps: string[], progressPct: number): StepLockStatus[] {
  const completedCount = Math.round((progressPct / 100) * steps.length);
  return steps.map((_, idx) => {
    if (idx < completedCount) return 'COMPLETED';
    if (idx === completedCount && completedCount < steps.length) return 'OPEN';
    return 'LOCKED';
  });
}

/* ─── Status Box Styles ──────────────────────────────────────────────── */
function getStatusBoxClass(status: StepLockStatus): string {
  if (status === 'COMPLETED') return 'from-emerald-50 to-emerald-100/60 border-emerald-200';
  if (status === 'OPEN') return 'from-amber-50 to-yellow-50 border-amber-300 ring-2 ring-amber-300/60 ring-offset-1';
  return 'from-slate-50 to-slate-50 border-slate-200';
}

function getStatusTextClass(status: StepLockStatus): string {
  if (status === 'COMPLETED') return 'text-emerald-800';
  if (status === 'OPEN') return 'text-amber-800';
  return 'text-slate-400';
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
        <div className="h-20 w-48 rounded-xl bg-zinc-100 shrink-0" />
      </div>
    ))}
  </div>
);

/* ─── Confirmation Modal ─────────────────────────────────────────────── */
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: 'gold' | 'red';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title, message, confirmLabel, confirmColor, onConfirm, onCancel,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm mx-4 overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-sm font-black text-navy mb-2">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-navy border border-slate-200 rounded-xl px-4 py-2 transition-colors hover:border-slate-300"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            'text-xs font-black text-white rounded-xl px-4 py-2 transition-colors',
            confirmColor === 'gold' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Attachment Box Component ───────────────────────────────────────── */
interface AttachmentBoxProps {
  stepIdx: number;
  status: StepLockStatus;
  attachments: Attachment[];
  linkInput: string;
  linkError: string;
  onFileSelect: (stepIdx: number, files: FileList) => void;
  onLinkInputChange: (stepIdx: number, val: string) => void;
  onLinkAdd: (stepIdx: number) => void;
  onRemove: (stepIdx: number, attId: string) => void;
}

const AttachmentBox: React.FC<AttachmentBoxProps> = ({
  stepIdx,
  status,
  attachments,
  linkInput,
  linkError,
  onFileSelect,
  onLinkInputChange,
  onLinkAdd,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOpen = status === 'OPEN';
  const fileCount = attachments.filter(a => a.type === 'file').length;
  const canAddFile = isOpen && fileCount < MAX_FILES;

  const fileAttachments = attachments.filter((a): a is AttachFile => a.type === 'file');
  const linkAttachments = attachments.filter((a): a is AttachLink => a.type === 'link');

  return (
    <div className={cn(
      'rounded-xl border px-3 py-2.5',
      status === 'COMPLETED' && 'bg-emerald-50/30 border-emerald-100',
      status === 'OPEN' && 'bg-white border-amber-200',
      status === 'LOCKED' && 'bg-slate-50/50 border-slate-100',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Lampiran
          {attachments.length > 0 && (
            <span className="ml-1 text-slate-300">({attachments.length})</span>
          )}
        </p>
        <div className="flex items-center gap-1">
          {status === 'COMPLETED' && <Lock className="h-2.5 w-2.5 text-emerald-400" />}
          {isOpen && (
            <span className={cn(
              'text-[9px] font-bold',
              fileCount >= MAX_FILES ? 'text-slate-300' : 'text-amber-400',
            )}>
              {fileCount}/{MAX_FILES}
            </span>
          )}
        </div>
      </div>

      {/* File list */}
      {fileAttachments.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {fileAttachments.map(att => (
            <div key={att.id} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 group/att">
                {getFileIcon(att.mimeType)}
                <span className={cn(
                  'text-[11px] font-medium truncate flex-1 leading-tight',
                  isOpen ? 'text-slate-700' : 'text-slate-500',
                )}>
                  {att.name}
                </span>
                {isOpen && !att.uploading && (
                  <button
                    onClick={() => onRemove(stepIdx, att.id)}
                    className="h-3.5 w-3.5 rounded flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover/att:opacity-100 shrink-0"
                    title="Hapus lampiran"
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
              {/* Size or upload progress */}
              {att.uploading ? (
                <div className="flex items-center gap-1.5 pl-4">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${att.progress ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-amber-500 shrink-0">
                    {att.progress ?? 0}%
                  </span>
                </div>
              ) : (
                <p className="text-[9px] text-slate-300 pl-4">{formatBytes(att.size)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Link list */}
      {linkAttachments.length > 0 && (
        <div className="space-y-1 mb-2">
          {linkAttachments.map(att => (
            <div key={att.id} className="flex items-center gap-1.5 group/att">
              <LinkIcon className="h-3 w-3 shrink-0 text-blue-500" />
              <span className="text-[11px] font-medium text-blue-600 truncate flex-1 leading-tight">
                {att.url.replace(/^https?:\/\//, '').split('/')[0]}
              </span>
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-3.5 w-3.5 flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors shrink-0"
                title="Buka di tab baru"
              >
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {isOpen && (
                <button
                  onClick={() => onRemove(stepIdx, att.id)}
                  className="h-3.5 w-3.5 rounded flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover/att:opacity-100 shrink-0"
                  title="Hapus link"
                >
                  <XIcon className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {attachments.length === 0 && !isOpen && (
        <p className="text-[11px] text-zinc-300 italic">—</p>
      )}

      {/* OPEN: Upload controls */}
      {isOpen && (
        <div className="mt-2 space-y-2 border-t border-amber-100 pt-2">

          {/* Upload button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => canAddFile && fileInputRef.current?.click()}
              disabled={!canAddFile}
              className={cn(
                'flex items-center gap-1 text-[11px] font-bold rounded-lg px-2.5 py-1.5 transition-colors border',
                canAddFile
                  ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                  : 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed',
              )}
              title={canAddFile ? 'Tambah dokumen' : 'Batas 2 dokumen per tahap'}
            >
              <Plus className="h-3 w-3" />
              Upload
            </button>
            <span className="text-[9px] text-slate-300 leading-tight">
              PDF/JPG/PNG · maks 2MB
            </span>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXT.join(',')}
            className="hidden"
            onChange={e => {
              if (e.target.files?.length) {
                onFileSelect(stepIdx, e.target.files);
                e.target.value = '';
              }
            }}
          />

          {/* Link input */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-400" />
                <input
                  type="text"
                  value={linkInput}
                  onChange={e => onLinkInputChange(stepIdx, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onLinkAdd(stepIdx)}
                  placeholder="Paste link Drive di sini..."
                  className={cn(
                    'w-full pl-6 pr-2 py-1.5 text-[11px] rounded-lg border bg-white focus:outline-none transition-colors',
                    linkError
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-slate-200 focus:border-blue-300',
                  )}
                />
              </div>
              <button
                onClick={() => onLinkAdd(stepIdx)}
                disabled={!linkInput.trim()}
                className={cn(
                  'flex items-center justify-center h-[28px] w-[28px] rounded-lg border transition-colors shrink-0',
                  linkInput.trim()
                    ? 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed',
                )}
                title="Tambahkan link"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {linkError && (
              <p className="text-[10px] text-red-500 font-medium">{linkError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [stepStatuses, setStepStatuses] = useState<StepLockStatus[]>([]);
  const [confirmLock, setConfirmLock] = useState<number | null>(null);
  const [confirmUnlock, setConfirmUnlock] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Attachment state
  const [stepAttachments, setStepAttachments] = useState<Record<number, Attachment[]>>({});
  const [linkInputs, setLinkInputs] = useState<Record<number, string>>({});
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});

  const isNotaris = profile?.role === 'NOTARIS';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    NotaryHttpClient.get(`/api/consumers/${id}`)
      .then(async (res) => {
        if (!res.ok) { setNotFound(true); return; }
        const data: FolderListItem = await res.json();
        setConsumer(data);
        const steps = CATALOG_STEPS[data.catalog_code] || DEFAULT_STEPS;
        const statuses = initStepStatuses(steps, data.progress_pct);
        setStepStatuses(statuses);

        const initialNotes: Record<number, string> = {};
        const initialAttachments: Record<number, Attachment[]> = {};
        steps.forEach((_, idx) => {
          const note = getMockNote(idx, statuses[idx]);
          if (note) initialNotes[idx] = note;
          initialAttachments[idx] = initMockAttachments(idx, statuses[idx]);
        });
        setNotes(initialNotes);
        setStepAttachments(initialAttachments);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const persistStatuses = useCallback(async (statuses: StepLockStatus[], steps: string[]) => {
    if (!id) return;
    const completedCount = statuses.filter(s => s === 'COMPLETED').length;
    const newPct = Math.round((completedCount / steps.length) * 100);
    const openIdx = statuses.findIndex(s => s === 'OPEN');
    const milestone = openIdx >= 0 ? steps[openIdx] : steps[steps.length - 1];
    try {
      setSaving(true);
      await NotaryHttpClient.patch(`/api/consumers/${id}`, {
        progress_pct: newPct,
        current_milestone: milestone,
        step_statuses: statuses,
      });
    } catch (_) {
    } finally {
      setSaving(false);
    }
  }, [id]);

  const handleLockStep = useCallback((stepIdx: number) => {
    if (!consumer) return;
    const steps = CATALOG_STEPS[consumer.catalog_code] || DEFAULT_STEPS;
    setStepStatuses(prev => {
      const next = [...prev];
      next[stepIdx] = 'COMPLETED';
      if (stepIdx + 1 < next.length) next[stepIdx + 1] = 'OPEN';
      persistStatuses(next, steps);
      return next;
    });
    setConfirmLock(null);
  }, [consumer, persistStatuses]);

  const handleUnlockStep = useCallback((stepIdx: number) => {
    if (!consumer) return;
    const steps = CATALOG_STEPS[consumer.catalog_code] || DEFAULT_STEPS;
    setStepStatuses(prev => {
      const next = [...prev];
      next[stepIdx] = 'OPEN';
      for (let i = stepIdx + 1; i < next.length; i++) next[i] = 'LOCKED';
      persistStatuses(next, steps);
      return next;
    });
    setConfirmUnlock(null);
  }, [consumer, persistStatuses]);

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

  /* ─── Attachment Handlers ─────────────────────────────────────────── */
  const handleFileSelect = useCallback((stepIdx: number, files: FileList) => {
    const file = files[0];
    if (!file) return;

    const currentFiles = (stepAttachments[stepIdx] ?? []).filter(a => a.type === 'file');
    if (currentFiles.length >= MAX_FILES) return;

    if (!ALLOWED_MIME.includes(file.type)) {
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return;
    }

    const newAttachment: AttachFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      type: 'file',
      uploading: true,
      progress: 0,
    };

    setStepAttachments(prev => ({
      ...prev,
      [stepIdx]: [...(prev[stepIdx] ?? []), newAttachment],
    }));

    // Simulate upload progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 25) + 15;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setStepAttachments(prev => ({
          ...prev,
          [stepIdx]: (prev[stepIdx] ?? []).map(a =>
            a.id === newAttachment.id
              ? { ...a, uploading: false, progress: 100 }
              : a,
          ),
        }));
      } else {
        setStepAttachments(prev => ({
          ...prev,
          [stepIdx]: (prev[stepIdx] ?? []).map(a =>
            a.id === newAttachment.id ? { ...a, progress: prog } : a,
          ),
        }));
      }
    }, 300);
  }, [stepAttachments]);

  const handleLinkInputChange = useCallback((stepIdx: number, val: string) => {
    setLinkInputs(prev => ({ ...prev, [stepIdx]: val }));
    if (linkErrors[stepIdx]) {
      setLinkErrors(prev => ({ ...prev, [stepIdx]: '' }));
    }
  }, [linkErrors]);

  const handleLinkAdd = useCallback((stepIdx: number) => {
    const url = (linkInputs[stepIdx] ?? '').trim();
    if (!url) return;
    if (!isValidUrl(url)) {
      setLinkErrors(prev => ({ ...prev, [stepIdx]: 'URL tidak valid. Gunakan format https://...' }));
      return;
    }
    const newLink: AttachLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      type: 'link',
    };
    setStepAttachments(prev => ({
      ...prev,
      [stepIdx]: [...(prev[stepIdx] ?? []), newLink],
    }));
    setLinkInputs(prev => ({ ...prev, [stepIdx]: '' }));
    setLinkErrors(prev => ({ ...prev, [stepIdx]: '' }));
  }, [linkInputs]);

  const handleRemoveAttachment = useCallback((stepIdx: number, attId: string) => {
    setStepAttachments(prev => ({
      ...prev,
      [stepIdx]: (prev[stepIdx] ?? []).filter(a => a.id !== attId),
    }));
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

      {/* Confirmation Modals */}
      {confirmLock !== null && (
        <ConfirmModal
          title="Kunci Tahap Ini?"
          message={`Apakah Anda benar-benar akan mengunci status ajuan ini? Tahap "${steps[confirmLock]}" akan ditandai SELESAI dan tahap berikutnya akan dibuka.`}
          confirmLabel="Simpan & Kunci"
          confirmColor="gold"
          onConfirm={() => handleLockStep(confirmLock)}
          onCancel={() => setConfirmLock(null)}
        />
      )}

      {confirmUnlock !== null && (
        <ConfirmModal
          title="Buka Kembali Tahap Ini?"
          message={`Buka kembali tahap "${steps[confirmUnlock]}"? Semua tahap setelah ini akan kembali TERKUNCI.`}
          confirmLabel="Ya, Buka Kembali"
          confirmColor="red"
          onConfirm={() => handleUnlockStep(confirmUnlock)}
          onCancel={() => setConfirmUnlock(null)}
        />
      )}

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
          {saving && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Petugas: <span className="text-navy">{profile?.username || 'System'}</span></span>
          <span className="text-gold">•</span>
          <span className={cn(
            'px-2 py-0.5 rounded-md',
            isNotaris ? 'bg-gold/10 text-gold' : 'bg-zinc-100 text-slate-500',
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

          const status: StepLockStatus = stepStatuses[idx] ?? 'LOCKED';
          const boxClass = getStatusBoxClass(status);
          const textClass = getStatusTextClass(status);
          const timestamp = status !== 'LOCKED' ? getMockTimestamp(consumer.created_at, idx) : null;
          const noteText = notes[idx] ?? '';
          const isEditing = editingStep === idx;
          const isLocked = status === 'LOCKED';

          const isLast = idx === steps.length - 1
            || steps.slice(idx + 1).every((_, i) => deletedSteps.has(idx + 1 + i));

          return (
            <div key={idx}>
              {/* Step Row */}
              <div className={cn('flex gap-3 items-start group/row', isLocked && 'opacity-50')}>

                {/* LEFT: Status Box */}
                <div className="shrink-0" style={{ width: 172 }}>
                  <div className={cn(
                    'rounded-xl border bg-gradient-to-br px-3 py-2.5 relative',
                    boxClass,
                  )}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest opacity-70', textClass)}>
                        Step {idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        {status === 'COMPLETED' && isNotaris && (
                          <button
                            onClick={() => setConfirmUnlock(idx)}
                            title="Buka kembali tahap ini (Notaris Only)"
                            className="h-4 w-4 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LockOpen className="h-3 w-3" />
                          </button>
                        )}
                        {status === 'COMPLETED' && (
                          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                        {status === 'OPEN' && (
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {status === 'LOCKED' && (
                          <Lock className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <p className={cn('text-xs font-bold leading-tight', textClass)}>{stepLabel}</p>
                    {timestamp && (
                      <p className={cn('text-[10px] mt-1.5 font-medium opacity-60', textClass)}>
                        {timestamp}
                      </p>
                    )}
                    {status === 'LOCKED' && (
                      <p className="text-[10px] mt-1 font-medium text-slate-400 italic">Belum dimulai</p>
                    )}
                    {status === 'OPEN' && (
                      <p className="text-[10px] mt-1 font-black text-amber-600 uppercase tracking-wide">
                        Sedang Berjalan
                      </p>
                    )}
                  </div>
                </div>

                {/* MIDDLE: Notes Box */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="rounded-xl border border-amber-300 bg-white shadow-sm overflow-hidden">
                      <textarea
                        value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs text-navy font-medium resize-none focus:outline-none"
                        rows={3}
                        placeholder="Tambahkan catatan untuk tahap ini..."
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-amber-100 bg-amber-50/50">
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-navy transition-colors px-2 py-1 rounded"
                        >
                          <XIcon className="h-3 w-3" /> Batal
                        </button>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="flex items-center gap-1 text-[10px] font-black text-white bg-amber-500 rounded-lg px-3 py-1.5 hover:bg-amber-600 transition-colors"
                        >
                          <Check className="h-3 w-3" /> Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'rounded-xl border bg-white px-3 py-2.5 min-h-[64px] transition-all',
                        status === 'OPEN' && 'border-amber-200 hover:border-amber-300 hover:shadow-sm cursor-pointer',
                        status === 'COMPLETED' && 'border-slate-200 bg-emerald-50/30',
                        status === 'LOCKED' && 'border-slate-100 bg-slate-50/50',
                      )}
                      onClick={() => { if (status === 'OPEN') handleStartEdit(idx, noteText); }}
                      title={status === 'OPEN' ? 'Klik untuk edit catatan' : undefined}
                    >
                      {noteText ? (
                        <p className={cn(
                          'text-xs leading-relaxed',
                          status === 'COMPLETED' ? 'text-slate-500' : 'text-slate-700',
                        )}>
                          {noteText}
                        </p>
                      ) : status !== 'LOCKED' ? (
                        <p className="text-xs text-slate-400 italic">
                          {status === 'OPEN' ? 'Klik untuk tambah catatan...' : 'Belum ada catatan.'}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-300 italic">Tahap belum dimulai.</p>
                      )}
                      {status === 'OPEN' && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <Pencil className="h-2.5 w-2.5" />
                          <span>Edit Catatan</span>
                        </div>
                      )}
                      {status === 'COMPLETED' && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500">
                          <Lock className="h-2.5 w-2.5" />
                          <span className="font-bold">Catatan Terkunci</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT: Attachment Box */}
                <div className="shrink-0" style={{ width: 192 }}>
                  <AttachmentBox
                    stepIdx={idx}
                    status={status}
                    attachments={stepAttachments[idx] ?? []}
                    linkInput={linkInputs[idx] ?? ''}
                    linkError={linkErrors[idx] ?? ''}
                    onFileSelect={handleFileSelect}
                    onLinkInputChange={handleLinkInputChange}
                    onLinkAdd={handleLinkAdd}
                    onRemove={handleRemoveAttachment}
                  />
                </div>

                {/* FAR RIGHT: Actions */}
                <div className="shrink-0 flex flex-col items-start gap-2 pt-1" style={{ width: 124 }}>
                  {status === 'OPEN' && (
                    <button
                      onClick={() => setConfirmLock(idx)}
                      className="flex items-center gap-1.5 text-[11px] font-black text-white bg-amber-500 hover:bg-amber-600 rounded-xl px-3 py-2 transition-colors shadow-sm w-full justify-center"
                    >
                      <Save className="h-3 w-3" />
                      Simpan & Kunci
                    </button>
                  )}
                  {isNotaris && (
                    confirmDelete === idx ? (
                      <div className="flex flex-col gap-1 w-full">
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

              {/* Connector Arrow */}
              {!isLast && (
                <div className="flex items-center" style={{ paddingLeft: 68, height: 28 }}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-px h-4',
                      stepStatuses[idx] === 'COMPLETED' && stepStatuses[idx + 1] !== 'LOCKED'
                        ? 'bg-emerald-300'
                        : stepStatuses[idx] === 'OPEN'
                        ? 'bg-amber-300'
                        : 'bg-slate-200',
                    )} />
                    <ChevronDown className={cn(
                      'h-4 w-4 -mt-1',
                      stepStatuses[idx] === 'COMPLETED' && stepStatuses[idx + 1] !== 'LOCKED'
                        ? 'text-emerald-300'
                        : stepStatuses[idx] === 'OPEN'
                        ? 'text-amber-300'
                        : 'text-slate-300',
                    )} />
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
            <LockOpen className="h-3 w-3 text-red-400" />
            <span>Mode Notaris — Dapat mengunci & membuka kembali tahapan. Ikon merah = Override Unlock.</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span>Mode Staf — Hanya tahap aktif yang dapat diedit & dilampirkan.</span>
          </>
        )}
      </div>
    </div>
  );
};
