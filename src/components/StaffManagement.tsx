import React, { useState } from 'react';
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

/* ─── Mock Staff Data ─────────────────────────────────────────────────── */
const MOCK_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    tenant_id: 'tenant-1',
    username: 'budi.asisten',
    full_name: 'Budi Santoso',
    email: 'budi.asisten@notaris.id',
    role: 'ASISTEN_NOTARIS',
    status: 'ACTIVE',
    workload: 7,
    joined_at: '2024-02-15',
  },
  {
    id: 'staff-2',
    tenant_id: 'tenant-1',
    username: 'siti.keuangan',
    full_name: 'Siti Aminah',
    email: 'siti.keuangan@notaris.id',
    role: 'STAF_KEUANGAN',
    status: 'ACTIVE',
    workload: 5,
    joined_at: '2024-03-01',
  },
  {
    id: 'staff-3',
    tenant_id: 'tenant-1',
    username: 'rudi.admin',
    full_name: 'Rudi Hartono',
    email: 'rudi.admin@notaris.id',
    role: 'STAF_ADMINISTRASI',
    status: 'ACTIVE',
    workload: 12,
    joined_at: '2023-11-20',
  },
  {
    id: 'staff-4',
    tenant_id: 'tenant-1',
    username: 'eka.lapangan',
    full_name: 'Eka Prasetyo',
    email: 'eka.lapangan@notaris.id',
    role: 'STAF_LAPANGAN',
    status: 'INACTIVE',
    workload: 3,
    joined_at: '2024-01-10',
  },
  {
    id: 'staff-5',
    tenant_id: 'tenant-1',
    username: 'dewi.asisten',
    full_name: 'Dewi Lestari',
    email: 'dewi.asisten@notaris.id',
    role: 'ASISTEN_NOTARIS',
    status: 'ACTIVE',
    workload: 9,
    joined_at: '2024-05-01',
  },
  {
    id: 'staff-6',
    tenant_id: 'tenant-1',
    username: 'andi.lapangan',
    full_name: 'Andi Wijaya',
    email: 'andi.lapangan@notaris.id',
    role: 'STAF_LAPANGAN',
    status: 'ACTIVE',
    workload: 6,
    joined_at: '2024-04-18',
  },
];

/* ─── Role Badge ──────────────────────────────────────────────────────── */
const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const config = ROLE_CONFIG[role as StaffRole];
  if (!config) return <span className="text-xs text-slate-400 font-mono">{role}</span>;
  const Icon = config.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg border',
      config.badge,
      config.badgeText,
    )}>
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {config.label}
    </span>
  );
};

/* ─── Workload Bar ────────────────────────────────────────────────────── */
const WorkloadBar: React.FC<{ value: number; max?: number }> = ({ value, max = 15 }) => {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    pct >= 80 ? 'bg-red-400' :
    pct >= 60 ? 'bg-amber-400' :
    pct >= 30 ? 'bg-emerald-400' :
    'bg-slate-300';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-slate-500 tabular-nums w-5 text-right">{value}</span>
    </div>
  );
};

/* ─── Role Access Legend Card ─────────────────────────────────────────── */
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

/* ─── Main Component ─────────────────────────────────────────────────── */
export const StaffManagement: React.FC<StaffManagementProps> = ({ profile }) => {
  const isNotaris = profile?.role === 'NOTARIS';
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [roleDropdown, setRoleDropdown] = useState(false);

  const STAFF_ROLES: StaffRole[] = ['ASISTEN_NOTARIS', 'STAF_KEUANGAN', 'STAF_ADMINISTRASI', 'STAF_LAPANGAN'];

  const handleToggleStatus = (staffId: string) => {
    if (!isNotaris) return;
    setStaffList(prev =>
      prev.map(s =>
        s.id === staffId
          ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : s,
      ),
    );
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
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-black text-navy uppercase tracking-tight">Manajemen Staf</h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Kelola hak akses dan status staf kantor berdasarkan hierarki otoritas.
          </p>
        </div>
        {isNotaris && (
          <button className="flex items-center gap-1.5 text-xs font-black text-white bg-navy hover:bg-navy/90 rounded-xl px-3 py-2 transition-colors shadow-sm">
            <UserPlus className="h-3.5 w-3.5" />
            Tambah Staf
          </button>
        )}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-navy" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staf</p>
            <p className="text-sm font-black text-navy">{staffList.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif</p>
            <p className="text-sm font-black text-emerald-700">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Non-Aktif</p>
            <p className="text-sm font-black text-slate-600">{staffList.length - activeCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Briefcase className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Beban</p>
            <p className="text-sm font-black text-amber-700">{totalWorkload} Ajuan</p>
          </div>
        </div>
      </div>

      {/* ── Role Access Legend ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hierarki Akses Role</p>
        <div className="grid grid-cols-4 gap-3">
          {STAFF_ROLES.map(role => (
            <RoleLegendCard key={role} role={role} />
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Table Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
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

          {/* Role Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdown(p => !p)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 bg-white hover:border-slate-300 transition-colors"
            >
              <Shield className="h-3 w-3 text-slate-400" />
              {filterRole === 'ALL' ? 'Semua Role' : ROLE_CONFIG[filterRole as StaffRole]?.label || filterRole}
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {roleDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => { setFilterRole('ALL'); setRoleDropdown(false); }}
                  className={cn(
                    'w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50 transition-colors',
                    filterRole === 'ALL' ? 'text-navy' : 'text-slate-600',
                  )}
                >
                  Semua Role
                </button>
                {STAFF_ROLES.map(r => {
                  const cfg = ROLE_CONFIG[r];
                  return (
                    <button
                      key={r}
                      onClick={() => { setFilterRole(r); setRoleDropdown(false); }}
                      className={cn(
                        'w-full text-left text-xs font-bold px-3 py-2 hover:bg-slate-50 flex items-center gap-2 transition-colors',
                        filterRole === r ? 'text-navy' : 'text-slate-600',
                      )}
                    >
                      <div className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="ml-auto text-[10px] font-bold text-slate-400">
            {filtered.length} dari {staffList.length} staf
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5">
                  Staf
                </th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5">
                  Role & Akses
                </th>
                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5">
                  Status
                </th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5">
                  Beban Kerja
                </th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5">
                  Bergabung
                </th>
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
                      {/* Staff Info */}
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

                      {/* Role Badge */}
                      <td className="px-4 py-3">
                        <RoleBadge role={staff.role} />
                        {config && (
                          <p className="text-[10px] text-slate-400 mt-1 leading-tight">{config.description}</p>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {isNotaris ? (
                            <button
                              onClick={() => handleToggleStatus(staff.id)}
                              className="flex items-center gap-1 group"
                              title="Toggle status (Notaris only)"
                            >
                              {isActive ? (
                                <ToggleRight className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 opacity-50 cursor-not-allowed" title="Hanya Notaris yang dapat mengubah status">
                              {isActive ? (
                                <ToggleRight className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-slate-300" />
                              )}
                              <Lock className="h-2.5 w-2.5 text-slate-300" />
                            </div>
                          )}
                          <span className={cn(
                            'text-[10px] font-black uppercase tracking-widest',
                            isActive ? 'text-emerald-600' : 'text-slate-400',
                          )}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Workload */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {staff.workload} Ajuan Aktif
                          </p>
                          <WorkloadBar value={staff.workload} />
                        </div>
                      </td>

                      {/* Joined Date */}
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
              <span>Mode Notaris — Toggle status staf tersedia.</span>
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
  );
};
