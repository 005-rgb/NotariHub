import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Shield,
  Briefcase,
  FileText,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Activity,
  ChevronDown,
  Search,
  UserPlus,
  Lock,
  Star,
  X as XIcon,
  Eye,
  EyeOff,
  Building2,
  Sliders,
  CheckSquare,
  Square,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StaffMember, UserProfile, UserRole } from '../types';

interface StaffManagementProps {
  profile: UserProfile | null;
}

/* ─── Role Config ─────────────────────────────────────────────────────── */
type StaffRole = 'ASISTEN_NOTARIS' | 'STAF_KEUANGAN' | 'STAF_ADMINISTRASI' | 'STAF_LAPANGAN';

interface RoleConfig {
  label: string;
  icon: React.ElementType;
  badge: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  ring: string;
  description: string;
  accessSummary: string[];
}

const ROLE_CONFIG: Record<StaffRole, RoleConfig> = {
  ASISTEN_NOTARIS: {
    label: 'Asisten Notaris',
    icon: Star,
    badge: 'bg-violet-100 border-violet-200',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
    dot: 'bg-violet-500',
    ring: 'ring-violet-300',
    description: 'Akses Global — Lihat semua data & laporan.',
    accessSummary: ['Lihat semua data & laporan', 'Tidak dapat Unlock Step', 'Tidak dapat Rollback'],
  },
  STAF_KEUANGAN: {
    label: 'Staf Keuangan',
    icon: Briefcase,
    badge: 'bg-rose-100 border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    dot: 'bg-rose-500',
    ring: 'ring-rose-300',
    description: 'Akses Full Admin + Lapangan + Keuangan (Read/Update).',
    accessSummary: ['Full Admin & Lapangan', 'Akses Keuangan Read/Update', 'Tidak ada akses hapus'],
  },
  STAF_ADMINISTRASI: {
    label: 'Staf Administrasi',
    icon: FileText,
    badge: 'bg-emerald-100 border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-300',
    description: 'Akses Input internal & Upload dokumen.',
    accessSummary: ['Input data internal', 'Upload dokumen', 'Tidak ada akses laporan keuangan'],
  },
  STAF_LAPANGAN: {
    label: 'Staf Lapangan',
    icon: MapPin,
    badge: 'bg-amber-100 border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    dot: 'bg-amber-500',
    ring: 'ring-amber-300',
    description: 'Akses Update progres luar & Resi.',
    accessSummary: ['Update progres lapangan', 'Akses resi & pengiriman', 'Tidak ada akses admin'],
  },
};

const STAFF_ROLES: StaffRole[] = ['ASISTEN_NOTARIS', 'STAF_KEUANGAN', 'STAF_ADMINISTRASI', 'STAF_LAPANGAN'];

const CABANG_OPTIONS = [
  'Jakarta Pusat',
  'Jakarta Selatan',
  'Jakarta Utara',
  'Jakarta Barat',
  'Jakarta Timur',
  'Bandung Kota',
  'Surabaya',
  'Medan',
  'Semarang',
];

const SPESIALISASI_OPTIONS: Record<StaffRole, string[]> = {
  ASISTEN_NOTARIS: ['Akta Jual Beli', 'Pertanahan', 'Hukum Keluarga', 'Perbankan', 'Badan Hukum'],
  STAF_KEUANGAN: ['Laporan Keuangan', 'Pembayaran & Tagihan', 'Audit Internal', 'Perpajakan'],
  STAF_ADMINISTRASI: ['Pengarsipan', 'Input Data', 'Layanan Konsumen', 'Korespondensi'],
  STAF_LAPANGAN: ['Pengiriman Dokumen', 'Verifikasi Lapangan', 'Resi & Ekspedisi', 'Pengecekan Lokasi'],
};

/* ─── Mock Staff Data ─────────────────────────────────────────────────── */
const MOCK_STAFF: StaffMember[] = [
  {
    id: 'staff-1', tenant_id: 'tenant-1', username: 'budi.asisten',
    full_name: 'Budi Santoso', email: 'budi.asisten@notaris.id',
    role: 'ASISTEN_NOTARIS', status: 'ACTIVE', workload: 7, joined_at: '2024-02-15',
  },
  {
    id: 'staff-2', tenant_id: 'tenant-1', username: 'siti.keuangan',
    full_name: 'Siti Aminah', email: 'siti.keuangan@notaris.id',
    role: 'STAF_KEUANGAN', status: 'ACTIVE', workload: 5, joined_at: '2024-03-01',
  },
  {
    id: 'staff-3', tenant_id: 'tenant-1', username: 'rudi.admin',
    full_name: 'Rudi Hartono', email: 'rudi.admin@notaris.id',
    role: 'STAF_ADMINISTRASI', status: 'ACTIVE', workload: 12, joined_at: '2023-11-20',
  },
  {
    id: 'staff-4', tenant_id: 'tenant-1', username: 'eka.lapangan',
    full_name: 'Eka Prasetyo', email: 'eka.lapangan@notaris.id',
    role: 'STAF_LAPANGAN', status: 'INACTIVE', workload: 3, joined_at: '2024-01-10',
  },
  {
    id: 'staff-5', tenant_id: 'tenant-1', username: 'dewi.asisten',
    full_name: 'Dewi Lestari', email: 'dewi.asisten@notaris.id',
    role: 'ASISTEN_NOTARIS', status: 'ACTIVE', workload: 9, joined_at: '2024-05-01',
  },
  {
    id: 'staff-6', tenant_id: 'tenant-1', username: 'andi.lapangan',
    full_name: 'Andi Wijaya', email: 'andi.lapangan@notaris.id',
    role: 'STAF_LAPANGAN', status: 'ACTIVE', workload: 6, joined_at: '2024-04-18',
  },
];

/* ─── Form State ──────────────────────────────────────────────────────── */
interface StaffFormState {
  full_name: string;
  email: string;
  password: string;
  role: StaffRole | '';
  spesialisasi: string;
  cabang: string;
  kapasitas: string;
  akses_laporan_strategis: boolean;
}

const EMPTY_FORM: StaffFormState = {
  full_name: '',
  email: '',
  password: '',
  role: '',
  spesialisasi: '',
  cabang: '',
  kapasitas: '',
  akses_laporan_strategis: false,
};

/* ─── Sub-Components ──────────────────────────────────────────────────── */
const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const config = ROLE_CONFIG[role as StaffRole];
  if (!config) return <span className="text-xs text-slate-400 font-mono">{role}</span>;
  const Icon = config.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg border',
      config.badge, config.badgeText,
    )}>
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {config.label}
    </span>
  );
};

const WorkloadBar: React.FC<{ value: number; max?: number }> = ({ value, max = 50 }) => {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 80 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : pct >= 30 ? 'bg-emerald-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-slate-500 tabular-nums w-5 text-right">{value}</span>
    </div>
  );
};

const RoleLegendCard: React.FC<{ role: StaffRole }> = ({ role }) => {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;
  return (
    <div className={cn('rounded-xl border px-3 py-2.5 flex flex-col gap-1.5', config.badge)}>
      <div className="flex items-center gap-1.5">
        <div className={cn('h-5 w-5 rounded-lg flex items-center justify-center', config.badgeBg)}>
          <Icon className={cn('h-3 w-3', config.badgeText)} />
        </div>
        <span className={cn('text-xs font-black', config.badgeText)}>{config.label}</span>
      </div>
      <ul className="space-y-0.5">
        {config.accessSummary.map((s, i) => (
          <li key={i} className="flex items-start gap-1 text-xs text-slate-500">
            <div className={cn('h-1 w-1 rounded-full mt-1.5 shrink-0', config.dot)} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ─── Toast ───────────────────────────────────────────────────────────── */
interface ToastProps {
  message: string;
  visible: boolean;
}
const Toast: React.FC<ToastProps> = ({ message, visible }) => (
  <div className={cn(
    'fixed bottom-8 right-8 z-[300] flex items-center gap-3 bg-navy text-white',
    'px-4 py-3 rounded-2xl shadow-2xl border border-white/10 max-w-sm',
    'transition-all duration-500',
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
  )}>
    <div className="h-6 w-6 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
      <Check className="h-3.5 w-3.5 text-white" />
    </div>
    <p className="text-xs font-bold leading-snug">{message}</p>
  </div>
);

/* ─── Field Label ─────────────────────────────────────────────────────── */
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
    {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const inputCls = (err?: boolean) => cn(
  'w-full px-3 py-2 text-xs text-slate-700 bg-white border rounded-xl',
  'focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-300',
  err
    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
    : 'border-slate-200 focus:border-navy/40 focus:ring-navy/10',
);

/* ─── Add Staff Modal ─────────────────────────────────────────────────── */
interface AddStaffModalProps {
  onClose: () => void;
  onSubmit: (data: StaffFormState) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormState, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const selectedRole = form.role as StaffRole | '';
  const showStrategicAccess = selectedRole === 'ASISTEN_NOTARIS' || selectedRole === 'STAF_KEUANGAN';
  const spesialisasiOptions = selectedRole ? SPESIALISASI_OPTIONS[selectedRole] : [];

  const set = <K extends keyof StaffFormState>(key: K, val: StaffFormState[K]) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof StaffFormState, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Nama wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.password) e.password = 'Password wajib diisi';
    else if (form.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (!form.role) e.role = 'Role wajib dipilih';
    if (!form.cabang) e.cabang = 'Cabang wajib dipilih';
    if (form.kapasitas && (isNaN(Number(form.kapasitas)) || Number(form.kapasitas) > 50 || Number(form.kapasitas) < 0)) {
      e.kapasitas = 'Kapasitas antara 0–50';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    setSubmitting(false);
    onSubmit(form);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-navy/5 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h2 className="text-sm font-black text-navy tracking-tight">Registrasi Personil Baru</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Manajemen Staf — Tambah Anggota
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* ── COLUMN 1 ── */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
                Informasi Identitas
              </p>

              {/* Nama Lengkap */}
              <div>
                <FieldLabel required>Nama Lengkap</FieldLabel>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={inputCls(!!errors.full_name)}
                />
                {errors.full_name && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <FieldLabel required>Email</FieldLabel>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="staf@kantor-notaris.id"
                  className={inputCls(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <FieldLabel required>Password Sementara</FieldLabel>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 karakter"
                    className={cn(inputCls(!!errors.password), 'pr-9')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* ── COLUMN 2 ── */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
                Posisi & Penugasan
              </p>

              {/* Role */}
              <div>
                <FieldLabel required>Role / Jabatan</FieldLabel>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={e => {
                      set('role', e.target.value as StaffRole);
                      set('spesialisasi', '');
                    }}
                    className={cn(inputCls(!!errors.role), 'appearance-none pr-8 cursor-pointer')}
                  >
                    <option value="">— Pilih Role —</option>
                    {STAFF_ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
                {errors.role && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.role}</p>
                )}
                {/* Role badge preview */}
                {selectedRole && (
                  <div className={cn(
                    'mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border',
                    ROLE_CONFIG[selectedRole].badge,
                    ROLE_CONFIG[selectedRole].badgeText,
                  )}>
                    {React.createElement(ROLE_CONFIG[selectedRole].icon, { className: 'h-2.5 w-2.5' })}
                    {ROLE_CONFIG[selectedRole].description}
                  </div>
                )}
              </div>

              {/* Spesialisasi */}
              <div>
                <FieldLabel>Spesialisasi</FieldLabel>
                <div className="relative">
                  <select
                    value={form.spesialisasi}
                    onChange={e => set('spesialisasi', e.target.value)}
                    disabled={!selectedRole}
                    className={cn(inputCls(), 'appearance-none pr-8 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed')}
                  >
                    <option value="">— Pilih Spesialisasi —</option>
                    {spesialisasiOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Cabang */}
              <div>
                <FieldLabel required>Cabang / Wilayah</FieldLabel>
                <div className="relative">
                  <select
                    value={form.cabang}
                    onChange={e => set('cabang', e.target.value)}
                    className={cn(inputCls(!!errors.cabang), 'appearance-none pr-8 cursor-pointer')}
                  >
                    <option value="">— Pilih Cabang —</option>
                    {CABANG_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
                {errors.cabang && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.cabang}</p>
                )}
              </div>

              {/* Kapasitas Kerja */}
              <div>
                <FieldLabel>Kapasitas Kerja (maks. 50 ajuan)</FieldLabel>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.kapasitas}
                  onChange={e => set('kapasitas', e.target.value)}
                  placeholder="0 – 50"
                  className={inputCls(!!errors.kapasitas)}
                />
                {errors.kapasitas && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.kapasitas}</p>
                )}
              </div>
            </div>

          </div>

          {/* ── Auth-Lock Section: conditional for ASISTEN & KEUANGAN ── */}
          {showStrategicAccess && (
            <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3 space-y-2">
              <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                Hak Akses Strategis
              </p>

              {/* Checkbox */}
              <button
                type="button"
                onClick={() => set('akses_laporan_strategis', !form.akses_laporan_strategis)}
                className="flex items-start gap-2 w-full text-left group"
              >
                <div className="mt-0.5 shrink-0">
                  {form.akses_laporan_strategis ? (
                    <CheckSquare className="h-4 w-4 text-violet-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">Berikan Akses Laporan Strategis</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Izinkan personil ini membaca laporan keuangan, statistik kantor, dan rekap kinerja.
                  </p>
                </div>
              </button>

              {/* Auth-lock warning */}
              <div className="flex items-start gap-2 pt-1 border-t border-violet-200/60">
                <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  <span className="text-amber-600">Catatan:</span> Fitur{' '}
                  <span className="font-black text-slate-700">Unlock Step</span> dan{' '}
                  <span className="font-black text-slate-700">Rollback Proses</span>{' '}
                  hanya tersedia untuk <span className="font-black text-navy">Akun Notaris Utama</span>.
                  Role ini tidak memiliki akses ke kedua fungsi tersebut.
                </p>
              </div>
            </div>
          )}

          {/* General auth-lock note for other roles */}
          {!showStrategicAccess && selectedRole && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Lock className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Fitur <span className="font-black text-slate-600">Unlock Step</span> dan{' '}
                <span className="font-black text-slate-600">Rollback Proses</span> hanya tersedia untuk{' '}
                <span className="font-black text-navy">Akun Notaris Utama</span>.
              </p>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <p className="text-[10px] font-bold text-slate-400">
            <span className="text-rose-400">*</span> Wajib diisi
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-xs font-bold text-slate-500 hover:text-navy border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 transition-colors disabled:opacity-40"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                'flex items-center gap-1.5 text-xs font-black text-navy rounded-xl px-5 py-2 transition-all shadow-sm',
                'bg-[#C2A35D] hover:bg-[#B19251] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              {submitting ? (
                <>
                  <div className="h-3 w-3 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Simpan Personil
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
export const StaffManagement: React.FC<StaffManagementProps> = ({ profile }) => {
  const isNotaris = profile?.role === 'NOTARIS';
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: msg, visible: false }), 4000);
  };

  const handleToggleStatus = (staffId: string) => {
    if (!isNotaris) return;
    setStaffList(prev =>
      prev.map(s => s.id === staffId ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s),
    );
  };

  const handleAddStaff = (data: StaffFormState) => {
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      tenant_id: 'tenant-1',
      username: data.email.split('@')[0],
      full_name: data.full_name,
      email: data.email,
      role: data.role as StaffRole,
      status: 'ACTIVE',
      workload: data.kapasitas ? Number(data.kapasitas) : 0,
      joined_at: new Date().toISOString().split('T')[0],
    };
    setStaffList(prev => [newStaff, ...prev]);
    setShowModal(false);
    showToast(`Staf ${data.full_name} berhasil ditambahkan ke Cabang ${data.cabang}.`);
  };

  const filtered = staffList.filter(s => {
    const matchSearch =
      !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const activeCount = staffList.filter(s => s.status === 'ACTIVE').length;
  const totalWorkload = staffList.reduce((acc, s) => acc + s.workload, 0);

  return (
    <>
      {/* ── Modal ── */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddStaff}
        />
      )}

      {/* ── Toast ── */}
      <Toast message={toast.message} visible={toast.visible} />

      <div className="space-y-6 pb-12">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base font-black text-navy uppercase tracking-tight">Manajemen Staf</h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Kelola hak akses dan status staf kantor berdasarkan hierarki otoritas.
            </p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users, bg: 'bg-navy/5', color: 'text-navy', label: 'Total Staf', value: staffList.length, valColor: 'text-navy' },
            { icon: Activity, bg: 'bg-emerald-50', color: 'text-emerald-600', label: 'Aktif', value: activeCount, valColor: 'text-emerald-700' },
            { icon: Shield, bg: 'bg-slate-100', color: 'text-slate-500', label: 'Non-Aktif', value: staffList.length - activeCount, valColor: 'text-slate-600' },
            { icon: Briefcase, bg: 'bg-amber-50', color: 'text-amber-600', label: 'Total Beban', value: `${totalWorkload} Ajuan`, valColor: 'text-amber-700' },
          ].map(({ icon: Icon, bg, color, label, value, valColor }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center shrink-0', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className={cn('text-sm font-black', valColor)}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Role Access Legend ── */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hierarki Akses Role</p>
          <div className="grid grid-cols-4 gap-3">
            {STAFF_ROLES.map(role => <RoleLegendCard key={role} role={role} />)}
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Table Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, username, email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-navy/40 transition-colors"
              />
            </div>

            {/* Role Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setRoleDropdown(p => !p)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 bg-white hover:border-slate-300 transition-colors"
              >
                <Shield className="h-3 w-3 text-slate-400" />
                {filterRole === 'ALL' ? 'Semua Role' : ROLE_CONFIG[filterRole as StaffRole]?.label || filterRole}
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
              {roleDropdown && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => { setFilterRole('ALL'); setRoleDropdown(false); }}
                    className={cn('w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50 transition-colors', filterRole === 'ALL' ? 'text-navy' : 'text-slate-600')}
                  >
                    Semua Role
                  </button>
                  {STAFF_ROLES.map(r => {
                    const cfg = ROLE_CONFIG[r];
                    return (
                      <button
                        key={r}
                        onClick={() => { setFilterRole(r); setRoleDropdown(false); }}
                        className={cn('w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50 flex items-center gap-2 transition-colors', filterRole === r ? 'text-navy' : 'text-slate-600')}
                      >
                        <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-[10px] font-bold text-slate-400">
              {filtered.length} dari {staffList.length} staf
            </p>

            {/* Add Staff Button — top-right of toolbar */}
            {isNotaris && (
              <button
                onClick={() => setShowModal(true)}
                className="ml-auto flex items-center gap-1.5 text-xs font-black text-navy bg-[#C2A35D] hover:bg-[#B19251] rounded-xl px-3 py-1.5 transition-colors shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Tambah Staf Baru
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Staf', 'Role & Akses', 'Status', 'Beban Kerja', 'Bergabung'].map(h => (
                    <th key={h} className={cn(
                      'text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5',
                      h === 'Status' ? 'text-center' : 'text-left',
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-xs font-bold text-slate-300">
                      Tidak ada staf yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((staff, i) => {
                    const config = ROLE_CONFIG[staff.role as StaffRole];
                    const isActive = staff.status === 'ACTIVE';
                    const joinDate = new Date(staff.joined_at).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    });
                    return (
                      <tr
                        key={staff.id}
                        className={cn(
                          'border-b border-slate-50 transition-colors hover:bg-slate-50/60',
                          !isActive && 'opacity-60',
                          i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              'h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0',
                              config?.badgeBg || 'bg-slate-100',
                              config?.badgeText || 'text-slate-600',
                            )}>
                              {staff.full_name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-navy truncate">{staff.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{staff.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RoleBadge role={staff.role} />
                          {config && <p className="text-[10px] text-slate-400 mt-1 leading-tight">{config.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {isNotaris ? (
                              <button onClick={() => handleToggleStatus(staff.id)} className="flex items-center gap-1 group" title="Toggle status">
                                {isActive
                                  ? <ToggleRight className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                                  : <ToggleLeft className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 opacity-50 cursor-not-allowed">
                                {isActive ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                                <Lock className="h-2.5 w-2.5 text-slate-300" />
                              </div>
                            )}
                            <span className={cn('text-[10px] font-black uppercase tracking-widest', isActive ? 'text-emerald-600' : 'text-slate-400')}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.workload} Ajuan Aktif</p>
                            <WorkloadBar value={staff.workload} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-500">{joinDate}</p>
                          <p className="text-[10px] text-slate-300 font-mono">{staff.username}</p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/30">
            {isNotaris ? (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <ToggleRight className="h-3.5 w-3.5" />
                <span>Mode Notaris — Toggle status & tambah staf tersedia.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Lock className="h-3 w-3" />
                <span>Mode Staf — Hanya Notaris yang dapat mengubah status anggota.</span>
              </div>
            )}
            <p className="text-[10px] font-bold text-slate-400">
              {activeCount} aktif · {staffList.length - activeCount} non-aktif
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
