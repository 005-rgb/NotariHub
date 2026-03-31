import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Shield, Briefcase, FileText, MapPin, Star,
  ToggleLeft, ToggleRight, Activity, ChevronDown, Search,
  UserPlus, Lock, X as XIcon, Eye, EyeOff, Check,
  AlertTriangle, CheckSquare, Square, Building2, Plus,
  Pencil, Trash2, Phone, KeyRound,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StaffMember, UserProfile, UserRole } from '../types';

interface StaffManagementProps {
  profile: UserProfile | null;
}

/* ─── Types ───────────────────────────────────────────────────────────── */
type StaffRole = 'ASISTEN_NOTARIS' | 'STAF_KEUANGAN' | 'STAF_ADMINISTRASI' | 'STAF_LAPANGAN';
type ActiveTab = 'staff' | 'cabang';

interface Branch {
  id: string;
  name: string;
  code: string;
  alamat: string;
  phone: string;
  kepala: string;
  staff_count: number;
  created_at: string;
}

/* ─── Role Config ─────────────────────────────────────────────────────── */
interface RoleConfig {
  label: string;
  icon: React.ElementType;
  badge: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
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
    description: 'Akses Update progres luar & Resi.',
    accessSummary: ['Update progres lapangan', 'Akses resi & pengiriman', 'Tidak ada akses admin'],
  },
};

const STAFF_ROLES: StaffRole[] = ['ASISTEN_NOTARIS', 'STAF_KEUANGAN', 'STAF_ADMINISTRASI', 'STAF_LAPANGAN'];

const SPESIALISASI_OPTIONS: Record<StaffRole, string[]> = {
  ASISTEN_NOTARIS: ['Akta Jual Beli', 'Pertanahan', 'Hukum Keluarga', 'Perbankan', 'Badan Hukum'],
  STAF_KEUANGAN: ['Laporan Keuangan', 'Pembayaran & Tagihan', 'Audit Internal', 'Perpajakan'],
  STAF_ADMINISTRASI: ['Pengarsipan', 'Input Data', 'Layanan Konsumen', 'Korespondensi'],
  STAF_LAPANGAN: ['Pengiriman Dokumen', 'Verifikasi Lapangan', 'Resi & Ekspedisi', 'Pengecekan Lokasi'],
};

/* ─── Initial Data ────────────────────────────────────────────────────── */
const INITIAL_BRANCHES: Branch[] = [
  { id: 'cab-1', name: 'Cabang I', code: 'CAB-I', alamat: 'Jl. Merdeka No. 10, Jakarta Pusat', phone: '02112345678', kepala: 'Notaris Utama', staff_count: 4, created_at: '2022-01-15' },
  { id: 'cab-2', name: 'Cabang II', code: 'CAB-II', alamat: 'Jl. Gatot Subroto No. 45, Jakarta Selatan', phone: '02187654321', kepala: 'Notaris Junior', staff_count: 2, created_at: '2023-03-10' },
];

const INITIAL_STAFF: (StaffMember & { phone?: string; cabang?: string })[] = [
  { id: 'staff-1', tenant_id: 'tenant-1', username: 'budi.asisten', full_name: 'Budi Santoso', email: 'budi@notaris.id', phone: '081234567890', role: 'ASISTEN_NOTARIS', status: 'ACTIVE', workload: 7, joined_at: '2024-02-15', cabang: 'Cabang I' },
  { id: 'staff-2', tenant_id: 'tenant-1', username: 'siti.keuangan', full_name: 'Siti Aminah', email: 'siti@notaris.id', phone: '082134567891', role: 'STAF_KEUANGAN', status: 'ACTIVE', workload: 5, joined_at: '2024-03-01', cabang: 'Cabang I' },
  { id: 'staff-3', tenant_id: 'tenant-1', username: 'rudi.admin', full_name: 'Rudi Hartono', email: 'rudi@notaris.id', phone: '085134567892', role: 'STAF_ADMINISTRASI', status: 'ACTIVE', workload: 12, joined_at: '2023-11-20', cabang: 'Cabang II' },
  { id: 'staff-4', tenant_id: 'tenant-1', username: 'eka.lapangan', full_name: 'Eka Prasetyo', email: 'eka@notaris.id', phone: '085812345678', role: 'STAF_LAPANGAN', status: 'INACTIVE', workload: 3, joined_at: '2024-01-10', cabang: 'Cabang I' },
  { id: 'staff-5', tenant_id: 'tenant-1', username: 'dewi.asisten', full_name: 'Dewi Lestari', email: 'dewi@notaris.id', phone: '081312345679', role: 'ASISTEN_NOTARIS', status: 'ACTIVE', workload: 9, joined_at: '2024-05-01', cabang: 'Cabang II' },
  { id: 'staff-6', tenant_id: 'tenant-1', username: 'andi.lapangan', full_name: 'Andi Wijaya', email: 'andi@notaris.id', phone: '087812345680', role: 'STAF_LAPANGAN', status: 'ACTIVE', workload: 6, joined_at: '2024-04-18', cabang: 'Cabang I' },
];

/* ─── Shared UI ───────────────────────────────────────────────────────── */
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
    {children}{required && <span className="text-rose-400 ml-0.5">*</span>}
  </label>
);

const inputCls = (err?: boolean) => cn(
  'w-full px-3 py-2 text-xs text-slate-700 bg-white border rounded-xl',
  'focus:outline-none focus:ring-2 transition-colors placeholder:text-slate-300',
  err
    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
    : 'border-slate-200 focus:border-navy/40 focus:ring-navy/10',
);

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const cfg = ROLE_CONFIG[role as StaffRole];
  if (!cfg) return <span className="text-xs text-slate-400 font-mono">{role}</span>;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg border', cfg.badge, cfg.badgeText)}>
      <Icon className="h-2.5 w-2.5 shrink-0" />{cfg.label}
    </span>
  );
};

const WorkloadBar: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.min((value / 50) * 100, 100);
  const color = pct >= 80 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : pct >= 30 ? 'bg-emerald-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-black text-slate-500 tabular-nums">{value}</span>
    </div>
  );
};

/* ─── Toast ───────────────────────────────────────────────────────────── */
const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => (
  <div className={cn(
    'fixed bottom-8 right-8 z-[300] flex items-center gap-3 bg-navy text-white',
    'px-4 py-3 rounded-2xl shadow-2xl border border-white/10 max-w-sm',
    'transition-all duration-500',
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none',
  )}>
    <div className="h-6 w-6 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
      <Check className="h-3.5 w-3.5 text-white" />
    </div>
    <p className="text-xs font-bold leading-snug">{message}</p>
  </div>
);

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  let num = n;
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

/* ─── Add Branch Modal ────────────────────────────────────────────────── */
interface AddBranchModalProps {
  onClose: () => void;
  onSubmit: (b: { name: string; alamat: string; phone: string; kepala: string }) => void;
  nextIndex: number;
}
const AddBranchModal: React.FC<AddBranchModalProps> = ({ onClose, onSubmit, nextIndex }) => {
  const [name, setName] = useState(`Cabang ${toRoman(nextIndex)}`);
  const [alamat, setAlamat] = useState('');
  const [phone, setPhone] = useState('');
  const [kepala, setKepala] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nama cabang wajib diisi';
    if (!alamat.trim()) e.alamat = 'Alamat cabang wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ name: name.trim(), alamat: alamat.trim(), phone: phone.trim(), kepala: kepala.trim() });
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-navy/5 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-navy" />
            </div>
            <div>
              <p className="text-sm font-black text-navy">Tambah Cabang Baru</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manajemen Cabang — Input Data Kantor</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Row 1: Nama + Telepon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Nama Cabang</FieldLabel>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputCls(!!errors.name)}
                placeholder="Cabang I, Cabang II, dst."
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
            </div>
            <div>
              <FieldLabel>No. Telepon Cabang</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={cn(inputCls(), 'pl-8')}
                  placeholder="021xxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Alamat — full-width textarea */}
          <div>
            <FieldLabel required>Alamat Lengkap Cabang</FieldLabel>
            <textarea
              rows={3}
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
              className={cn(inputCls(!!errors.alamat), 'resize-none leading-relaxed')}
              placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan, Kota / Kabupaten"
            />
            {errors.alamat && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.alamat}</p>}
          </div>

          {/* Kepala */}
          <div>
            <FieldLabel>Kepala Cabang</FieldLabel>
            <input
              value={kepala}
              onChange={e => setKepala(e.target.value)}
              className={inputCls()}
              placeholder="Nama kepala cabang (opsional)"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-[10px] font-bold text-slate-400"><span className="text-rose-400">*</span> Wajib diisi</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-navy border border-slate-200 rounded-xl px-4 py-2 transition-colors">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 text-xs font-black text-navy bg-[#C2A35D] hover:bg-[#B19251] rounded-xl px-4 py-2 transition-colors shadow-sm active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Simpan Cabang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Reset Password Modal ────────────────────────────────────────────── */
interface ResetPasswordModalProps {
  staffName: string;
  onClose: () => void;
  onConfirm: (newPassword: string) => void;
}
const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ staffName, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: { password?: string; confirm?: string } = {};
    if (!password) e.password = 'Password baru wajib diisi';
    else if (password.length < 6) e.password = 'Min. 6 karakter';
    if (!confirm) e.confirm = 'Konfirmasi password wajib diisi';
    else if (confirm !== password) e.confirm = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    setSubmitting(false);
    onConfirm(password);
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-black text-navy">Reset Password Staf</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Aksi Privileged — NOTARIS Only</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-amber-700">Konfirmasi Reset Password</p>
            <p className="text-[10px] font-bold text-amber-600 mt-0.5 leading-relaxed">
              Password akun <span className="font-black text-amber-800">{staffName}</span> akan direset. Staf harus login ulang menggunakan password baru.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <FieldLabel required>Password Baru</FieldLabel>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Min. 6 karakter"
                className={cn(inputCls(!!errors.password), 'pr-9')}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.password}</p>}
          </div>
          <div>
            <FieldLabel required>Konfirmasi Password</FieldLabel>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: '' })); }}
                placeholder="Ulangi password baru"
                className={cn(inputCls(!!errors.confirm), 'pr-9')}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirm && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.confirm}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose} disabled={submitting} className="text-xs font-bold text-slate-500 hover:text-navy border border-slate-200 rounded-xl px-4 py-2 transition-colors disabled:opacity-40">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex items-center gap-1.5 text-xs font-black text-navy bg-[#C2A35D] hover:bg-[#B19251] rounded-xl px-4 py-2 transition-all shadow-sm disabled:opacity-60 active:scale-95"
          >
            {submitting
              ? <><div className="h-3 w-3 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Memperbarui...</>
              : <><KeyRound className="h-3.5 w-3.5" />Reset Password</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Add Staff Modal ─────────────────────────────────────────────────── */
interface StaffForm {
  full_name: string; email: string; phone: string; password: string;
  role: StaffRole | ''; spesialisasi: string; cabang: string;
  kapasitas: string; akses_laporan: boolean;
}
const EMPTY_STAFF_FORM: StaffForm = {
  full_name: '', email: '', phone: '', password: '',
  role: '', spesialisasi: '', cabang: '', kapasitas: '', akses_laporan: false,
};

interface AddStaffModalProps {
  branches: Branch[];
  onClose: () => void;
  onSubmit: (data: StaffForm) => void;
}
const AddStaffModal: React.FC<AddStaffModalProps> = ({ branches, onClose, onSubmit }) => {
  const [form, setForm] = useState<StaffForm>(EMPTY_STAFF_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffForm, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedRole = form.role as StaffRole | '';
  const showStrategicAccess = selectedRole === 'ASISTEN_NOTARIS' || selectedRole === 'STAF_KEUANGAN';
  const spesialisasiOpts = selectedRole ? SPESIALISASI_OPTIONS[selectedRole] : [];

  const set = <K extends keyof StaffForm>(k: K, v: StaffForm[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    if ((errors as any)[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof StaffForm, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Nama wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.password) e.password = 'Password wajib diisi';
    else if (form.password.length < 6) e.password = 'Min. 6 karakter';
    if (!form.role) e.role = 'Role wajib dipilih';
    if (!form.cabang) e.cabang = 'Cabang wajib dipilih';
    if (form.kapasitas && (isNaN(Number(form.kapasitas)) || Number(form.kapasitas) > 50 || Number(form.kapasitas) < 0))
      e.kapasitas = 'Kapasitas 0–50';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    setSubmitting(false);
    onSubmit(form);
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-navy/5 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-navy" />
            </div>
            <div>
              <p className="text-sm font-black text-navy">Registrasi Personil Baru</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manajemen Staf — Tambah Anggota</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Grid 2 col */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* Col 1 */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Informasi Identitas</p>
              <div>
                <FieldLabel required>Nama Lengkap</FieldLabel>
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Nama lengkap personil" className={inputCls(!!errors.full_name)} />
                {errors.full_name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <FieldLabel required>Email</FieldLabel>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="staf@kantor-notaris.id" className={inputCls(!!errors.email)} />
                {errors.email && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.email}</p>}
              </div>
              <div>
                <FieldLabel>No. Telepon</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08xxxxxxxxxx" className={cn(inputCls(), 'pl-8')} />
                </div>
              </div>
              <div>
                <FieldLabel required>Password Sementara</FieldLabel>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 karakter" className={cn(inputCls(!!errors.password), 'pr-9')} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.password}</p>}
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Posisi & Penugasan</p>
              <div>
                <FieldLabel required>Role / Jabatan</FieldLabel>
                <div className="relative">
                  <select value={form.role} onChange={e => { set('role', e.target.value as StaffRole); set('spesialisasi', ''); }} className={cn(inputCls(!!errors.role), 'appearance-none pr-8 cursor-pointer')}>
                    <option value="">— Pilih Role —</option>
                    {STAFF_ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
                {errors.role && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.role}</p>}
                {selectedRole && (
                  <span className={cn('mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border', ROLE_CONFIG[selectedRole].badge, ROLE_CONFIG[selectedRole].badgeText)}>
                    {React.createElement(ROLE_CONFIG[selectedRole].icon, { className: 'h-2.5 w-2.5' })}
                    {ROLE_CONFIG[selectedRole].description}
                  </span>
                )}
              </div>
              <div>
                <FieldLabel>Spesialisasi</FieldLabel>
                <div className="relative">
                  <select value={form.spesialisasi} onChange={e => set('spesialisasi', e.target.value)} disabled={!selectedRole} className={cn(inputCls(), 'appearance-none pr-8 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed')}>
                    <option value="">— Pilih Spesialisasi —</option>
                    {spesialisasiOpts.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <FieldLabel required>Cabang</FieldLabel>
                <div className="relative">
                  <select value={form.cabang} onChange={e => set('cabang', e.target.value)} className={cn(inputCls(!!errors.cabang), 'appearance-none pr-8 cursor-pointer')}>
                    <option value="">— Pilih Cabang —</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name} — {b.alamat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
                {errors.cabang && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.cabang}</p>}
              </div>
              <div>
                <FieldLabel>Kapasitas Kerja (maks. 50)</FieldLabel>
                <input type="number" min={0} max={50} value={form.kapasitas} onChange={e => set('kapasitas', e.target.value)} placeholder="0 – 50 ajuan" className={inputCls(!!errors.kapasitas)} />
                {errors.kapasitas && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.kapasitas}</p>}
              </div>
            </div>
          </div>

          {/* Strategic Access — ASISTEN & KEUANGAN only */}
          {showStrategicAccess && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3 space-y-2">
              <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="h-3 w-3" />Hak Akses Strategis
              </p>
              <button type="button" onClick={() => set('akses_laporan', !form.akses_laporan)} className="flex items-start gap-2 w-full text-left group">
                <div className="mt-0.5 shrink-0">
                  {form.akses_laporan
                    ? <CheckSquare className="h-4 w-4 text-violet-600" />
                    : <Square className="h-4 w-4 text-slate-400 group-hover:text-violet-400 transition-colors" />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">Berikan Akses Laporan Strategis</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">Izinkan personil membaca laporan keuangan, statistik kantor, dan rekap kinerja.</p>
                </div>
              </button>
              <div className="flex items-start gap-2 pt-1 border-t border-violet-200/60">
                <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  <span className="text-amber-600">Catatan:</span> Fitur <span className="font-black text-slate-700">Unlock Step</span> dan <span className="font-black text-slate-700">Rollback</span> hanya tersedia untuk <span className="font-black text-navy">Akun Notaris Utama</span>.
                </p>
              </div>
            </div>
          )}
          {!showStrategicAccess && selectedRole && (
            <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Lock className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Fitur <span className="font-black text-slate-600">Unlock Step</span> dan <span className="font-black text-slate-600">Rollback</span> hanya tersedia untuk <span className="font-black text-navy">Akun Notaris Utama</span>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <p className="text-[10px] font-bold text-slate-400"><span className="text-rose-400">*</span> Wajib diisi</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={submitting} className="text-xs font-bold text-slate-500 hover:text-navy border border-slate-200 rounded-xl px-4 py-2 transition-colors disabled:opacity-40">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 text-xs font-black text-navy bg-[#C2A35D] hover:bg-[#B19251] rounded-xl px-5 py-2 transition-all shadow-sm disabled:opacity-60 active:scale-95"
            >
              {submitting
                ? <><div className="h-3 w-3 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />Menyimpan...</>
                : <><UserPlus className="h-3.5 w-3.5" />Simpan Personil</>}
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('staff');
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [staffList, setStaffList] = useState<(StaffMember & { phone?: string; cabang?: string })[]>(INITIAL_STAFF);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterCabang, setFilterCabang] = useState<string>('ALL');
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [cabangDropdown, setCabangDropdown] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const roleRef = useRef<HTMLDivElement>(null);
  const cabangRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleDropdown(false);
      if (cabangRef.current && !cabangRef.current.contains(e.target as Node)) setCabangDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 4000);
  };

  const handleToggleStatus = (id: string) => {
    if (!isNotaris) return;
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s));
  };

  const handleAddBranch = (data: { name: string; alamat: string; phone: string; kepala: string }) => {
    const newBranch: Branch = {
      id: `cab-${Date.now()}`,
      name: data.name,
      code: `CAB-${branches.length + 1}`,
      alamat: data.alamat,
      phone: data.phone,
      kepala: data.kepala || 'Belum ditetapkan',
      staff_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setBranches(prev => [...prev, newBranch]);
    setShowAddBranch(false);
    showToast(`Cabang Baru "${data.name}" Berhasil Dibuat.`);
  };

  const handleResetPassword = (newPassword: string) => {
    if (!isNotaris || !resetTarget) return;
    setResetTarget(null);
    showToast(`Password Staf ${resetTarget.name} Berhasil Diperbarui.`);
  };

  const handleDeleteBranch = (id: string) => {
    const branch = branches.find(b => b.id === id);
    if (!branch) return;
    setBranches(prev => prev.filter(b => b.id !== id));
    showToast(`Cabang "${branch.name}" telah dihapus.`);
  };

  const handleAddStaff = (data: StaffForm) => {
    const newStaff = {
      id: `staff-${Date.now()}`,
      tenant_id: 'tenant-1',
      username: data.email.split('@')[0],
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role: data.role as StaffRole,
      status: 'ACTIVE' as const,
      workload: data.kapasitas ? Number(data.kapasitas) : 0,
      joined_at: new Date().toISOString().split('T')[0],
      cabang: data.cabang,
    };
    setStaffList(prev => [newStaff, ...prev]);
    setBranches(prev => prev.map(b => b.name === data.cabang ? { ...b, staff_count: b.staff_count + 1 } : b));
    setShowAddStaff(false);
    showToast(`Staf ${data.full_name} berhasil ditambahkan ke ${data.cabang}.`);
  };

  const filtered = staffList.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone || '').includes(q);
    const matchRole = filterRole === 'ALL' || s.role === filterRole;
    const matchCabang = filterCabang === 'ALL' || s.cabang === filterCabang;
    return matchSearch && matchRole && matchCabang;
  });

  const activeCount = staffList.filter(s => s.status === 'ACTIVE').length;

  return (
    <>
      {showAddBranch && <AddBranchModal nextIndex={branches.length + 1} onClose={() => setShowAddBranch(false)} onSubmit={handleAddBranch} />}
      {showAddStaff && <AddStaffModal branches={branches} onClose={() => setShowAddStaff(false)} onSubmit={handleAddStaff} />}
      {resetTarget && isNotaris && <ResetPasswordModal staffName={resetTarget.name} onClose={() => setResetTarget(null)} onConfirm={handleResetPassword} />}
      <Toast message={toast.message} visible={toast.visible} />

      <div className="space-y-5 pb-12">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-navy uppercase tracking-tight">Manajemen Staf & Cabang</h1>
            <p className="text-xs text-slate-400 mt-0.5">Kelola personil dan struktur kantor berdasarkan hierarki otoritas.</p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users, bg: 'bg-navy/5', ic: 'text-navy', label: 'Total Staf', val: staffList.length, vc: 'text-navy' },
            { icon: Activity, bg: 'bg-emerald-50', ic: 'text-emerald-600', label: 'Aktif', val: activeCount, vc: 'text-emerald-700' },
            { icon: Building2, bg: 'bg-blue-50', ic: 'text-blue-600', label: 'Total Cabang', val: branches.length, vc: 'text-blue-700' },
            { icon: Briefcase, bg: 'bg-amber-50', ic: 'text-amber-600', label: 'Total Beban', val: `${staffList.reduce((a, s) => a + s.workload, 0)} Ajuan`, vc: 'text-amber-700' },
          ].map(({ icon: Icon, bg, ic, label, val, vc }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center shrink-0', bg)}>
                <Icon className={cn('h-4 w-4', ic)} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className={cn('text-sm font-black', vc)}>{val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 border-b border-slate-200">
          {([['staff', Users, 'Daftar Staf'], ['cabang', Building2, 'Kelola Cabang']] as const).map(([tab, Icon, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-black px-4 py-2.5 border-b-2 transition-all',
                activeTab === tab
                  ? 'border-navy text-navy'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {tab === 'staff' && (
                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full', activeTab === 'staff' ? 'bg-navy/10 text-navy' : 'bg-slate-100 text-slate-400')}>
                  {staffList.length}
                </span>
              )}
              {tab === 'cabang' && (
                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full', activeTab === 'cabang' ? 'bg-navy/10 text-navy' : 'bg-slate-100 text-slate-400')}>
                  {branches.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: CABANG                                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'cabang' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {branches.length} cabang terdaftar — sumber dropdown penugasan staf
              </p>
              {isNotaris && (
                <button
                  onClick={() => setShowAddBranch(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-navy border-2 border-[#C2A35D] rounded-xl px-3 py-1.5 hover:bg-[#C2A35D]/10 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-[#C2A35D]" />
                  Tambah Cabang
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {branches.map((branch, idx) => (
                <div key={branch.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-navy to-navy/80 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-white/10 flex items-center justify-center">
                        <Building2 className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{branch.name}</p>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{branch.code}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-white/60 bg-white/10 px-2 py-0.5 rounded-lg">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-xs font-bold text-slate-600">{branch.alamat}</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Shield className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-500">{branch.kepala}</p>
                    </div>
                    {branch.phone && (
                      <div className="flex items-start gap-1.5">
                        <Phone className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs font-mono text-slate-500">{branch.phone}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span className="text-xs font-black text-navy">
                          {staffList.filter(s => s.cabang === branch.name).length} staf
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono">
                        {new Date(branch.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {isNotaris && (
                    <div className="flex items-center gap-1 px-4 pb-3">
                      <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-navy transition-colors px-2 py-1 rounded-lg hover:bg-slate-50">
                        <Pencil className="h-2.5 w-2.5" />Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-2.5 w-2.5" />Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {branches.length === 0 && (
              <div className="text-center py-16 text-xs font-bold text-slate-300">
                Belum ada cabang. Klik "Tambah Cabang" untuk memulai.
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB: STAFF                                                    */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'staff' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex-wrap">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama, email, telepon..."
                  className="pl-7 pr-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl w-52 focus:outline-none focus:border-navy/40 transition-colors"
                />
              </div>

              {/* Role Filter */}
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => setRoleDropdown(p => !p)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white hover:border-slate-300 transition-colors"
                >
                  <Shield className="h-3 w-3 text-slate-400" />
                  <span>{filterRole === 'ALL' ? 'Semua Role' : ROLE_CONFIG[filterRole as StaffRole]?.label || filterRole}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                {roleDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button onClick={() => { setFilterRole('ALL'); setRoleDropdown(false); }} className={cn('w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50', filterRole === 'ALL' ? 'text-navy' : 'text-slate-600')}>Semua Role</button>
                    {STAFF_ROLES.map(r => (
                      <button key={r} onClick={() => { setFilterRole(r); setRoleDropdown(false); }} className={cn('w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50 flex items-center gap-2', filterRole === r ? 'text-navy' : 'text-slate-600')}>
                        <div className={cn('h-1.5 w-1.5 rounded-full', ROLE_CONFIG[r].dot)} />
                        {ROLE_CONFIG[r].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cabang Filter */}
              <div className="relative" ref={cabangRef}>
                <button
                  onClick={() => setCabangDropdown(p => !p)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white hover:border-slate-300 transition-colors"
                >
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span>{filterCabang === 'ALL' ? 'Semua Cabang' : filterCabang}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                {cabangDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button onClick={() => { setFilterCabang('ALL'); setCabangDropdown(false); }} className={cn('w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50', filterCabang === 'ALL' ? 'text-navy' : 'text-slate-600')}>Semua Cabang</button>
                    {branches.map(b => (
                      <button key={b.id} onClick={() => { setFilterCabang(b.name); setCabangDropdown(false); }} className={cn('w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50', filterCabang === b.name ? 'text-navy' : 'text-slate-600')}>
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-bold text-slate-400">{filtered.length} dari {staffList.length}</span>

              {/* Add Staff Button */}
              {isNotaris && (
                <button
                  onClick={() => setShowAddStaff(true)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-black text-navy border-2 border-[#C2A35D] rounded-xl px-3 py-1.5 hover:bg-[#C2A35D]/10 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#C2A35D]" />
                  Tambah Staf Baru
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    {['No', 'Nama Staf', 'Role', 'Cabang', 'No. Telp', 'Beban Kerja', 'Status', 'Aksi'].map((h, i) => (
                      <th key={h} className={cn(
                        'text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2',
                        i === 0 ? 'text-center w-10' : 'text-left',
                        (h === 'Status' || h === 'Aksi') ? 'text-center' : '',
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-xs font-bold text-slate-300">
                        Tidak ada staf yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((staff, i) => {
                      const cfg = ROLE_CONFIG[staff.role as StaffRole];
                      const isActive = staff.status === 'ACTIVE';
                      return (
                        <tr
                          key={staff.id}
                          className={cn(
                            'border-b border-slate-50 transition-colors hover:bg-slate-50/50',
                            !isActive && 'opacity-50',
                          )}
                        >
                          {/* No */}
                          <td className="px-3 py-2 text-center">
                            <span className="text-[10px] font-black text-slate-300 tabular-nums">{i + 1}</span>
                          </td>

                          {/* Nama */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0', cfg?.badgeBg || 'bg-slate-100', cfg?.badgeText || 'text-slate-600')}>
                                {staff.full_name[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-navy truncate leading-tight">{staff.full_name}</p>
                                <p className="text-[10px] text-slate-400 truncate font-mono">{staff.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-3 py-2">
                            <RoleBadge role={staff.role} />
                          </td>

                          {/* Cabang */}
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                              <Building2 className="h-2.5 w-2.5" />
                              {staff.cabang || '—'}
                            </span>
                          </td>

                          {/* No Telp */}
                          <td className="px-3 py-2">
                            <span className="text-xs font-mono text-slate-500">{staff.phone || '—'}</span>
                          </td>

                          {/* Beban Kerja */}
                          <td className="px-3 py-2">
                            <WorkloadBar value={staff.workload} />
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {isNotaris ? (
                                <button onClick={() => handleToggleStatus(staff.id)} className="group" title="Toggle status">
                                  {isActive
                                    ? <ToggleRight className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                                    : <ToggleLeft className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />}
                                </button>
                              ) : (
                                <div className="opacity-40 cursor-not-allowed">
                                  {isActive ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                                </div>
                              )}
                              <span className={cn('text-[9px] font-black uppercase tracking-widest', isActive ? 'text-emerald-600' : 'text-slate-400')}>
                                {isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className="px-3 py-2 text-center">
                            {isNotaris ? (
                              <button
                                onClick={() => setResetTarget({ id: staff.id, name: staff.full_name })}
                                title={`Reset password ${staff.full_name}`}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg px-1.5 py-1 transition-all"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <div title="Hanya Notaris yang dapat mereset password" className="inline-flex items-center justify-center">
                                <KeyRound className="h-3.5 w-3.5 text-slate-200" />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/30">
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
                {activeCount} aktif · {staffList.length - activeCount} nonaktif
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
