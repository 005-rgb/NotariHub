import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBarChart,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';

type ReportRow = {
  id: string;
  client_name: string;
  nik: string;
  phone: string;
  catalog_code: string;
  current_milestone: string;
  progress_pct: number;
  is_vetoed: boolean;
  is_overdue: boolean;
  created_at: string;
};

const CATALOG_OPTIONS = ['Semua Katalog', 'AJB', 'APHT', 'SKMHT', 'FIDUSIA', 'WASIAT'];
const STATUS_OPTIONS = ['Semua Status', 'Validasi Pajak', 'Plotting', 'Tanda Tangan', 'Minuta', 'Selesai'];

const MILESTONE_STYLE: Record<string, { dot: string; badge: string }> = {
  'Selesai':        { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'Tanda Tangan':   { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  'Validasi Pajak': { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  'Plotting':       { dot: 'bg-violet-500',  badge: 'bg-violet-50 text-violet-700 border-violet-100' },
  'Minuta':         { dot: 'bg-slate-400',   badge: 'bg-slate-50 text-slate-600 border-slate-100' },
};

const DEFAULT_STYLE = { dot: 'bg-zinc-300', badge: 'bg-zinc-50 text-zinc-600 border-zinc-100' };

const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <tr style={{ opacity: 1 - index * 0.1 }}>
    {[32, 80, 140, 70, 110, 80].map((w, i) => (
      <td key={i} className="px-5 py-2.5">
        <div className="h-2.5 rounded-full bg-zinc-100 animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

function generateKodeAjuan(row: ReportRow): string {
  const numPart = row.id.replace('uuid-', '').padStart(3, '0');
  return `${row.catalog_code}-${numPart}`;
}

export const ReportsDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('Semua Katalog');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await NotaryHttpClient.get('/api/consumers');
        if (res.ok) {
          const json = await res.json();
          setAllData(json.data || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...allData];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        r =>
          r.client_name.toLowerCase().includes(q) ||
          generateKodeAjuan(r).toLowerCase().includes(q) ||
          r.nik?.toLowerCase().includes(q)
      );
    }
    if (catalogFilter !== 'Semua Katalog') {
      result = result.filter(r => r.catalog_code === catalogFilter);
    }
    if (statusFilter !== 'Semua Status') {
      result = result.filter(r => r.current_milestone === statusFilter);
    }
    return result;
  }, [allData, search, catalogFilter, statusFilter]);

  const statTotal = allData.length;
  const statSelesai = useMemo(() => allData.filter(d => d.current_milestone === 'Selesai').length, [allData]);
  const statOverdue = useMemo(() => allData.filter(d => d.is_overdue).length, [allData]);

  const handleRowClick = (id: string) => {
    navigate(`/direktori/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-gold/10 flex items-center justify-center shadow-sm">
            <FileBarChart className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h1 className="text-[14px] font-black text-navy uppercase tracking-tight leading-tight">
              Direktori Laporan Seluruh Ajuan
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Rekap lengkap status pengerjaan seluruh konsumen
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-zinc-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <FileText className="h-4 w-4 text-navy/40" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-sm font-black text-navy leading-none">{statTotal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Selesai</p>
              <p className="text-sm font-black text-emerald-700 leading-none">{statSelesai}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <Clock className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Overdue</p>
              <p className="text-sm font-black text-red-600 leading-none">{statOverdue}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-3 flex-wrap"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, kode ajuan, atau NIK…"
            className="w-full pl-9 pr-8 py-2.5 text-xs font-medium text-navy bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Katalog Filter */}
        <div className="relative">
          <select
            value={catalogFilter}
            onChange={e => setCatalogFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 text-xs font-bold text-navy bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all cursor-pointer"
          >
            {CATALOG_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 text-xs font-bold text-navy bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>

        {!loading && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            {filtered.length} laporan
          </span>
        )}
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="glass-card rounded-2xl ring-1 ring-gold/10 overflow-hidden"
      >
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              {['No', 'Kode Ajuan', 'Nama Konsumen', 'Katalog', 'Tanggal Masuk', 'Status Terakhir'].map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    "px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap",
                    i === 0 && "w-14 text-center"
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} index={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                      <FileBarChart className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-navy uppercase tracking-tight">Tidak Ada Laporan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => {
                const style = MILESTONE_STYLE[row.current_milestone] || DEFAULT_STYLE;
                const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const kode = generateKodeAjuan(row);

                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row.id)}
                    className="group border-b border-zinc-50 hover:bg-gold/5 cursor-pointer transition-colors duration-150"
                  >
                    {/* No */}
                    <td className="px-5 py-2.5 text-center">
                      <span className="text-[11px] font-bold text-slate-300">{idx + 1}</span>
                    </td>

                    {/* Kode Ajuan */}
                    <td className="px-5 py-2.5">
                      <span className="text-[11px] font-black text-navy/60 font-mono tracking-tight">
                        {kode}
                      </span>
                    </td>

                    {/* Nama Konsumen */}
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-navy uppercase tracking-tight truncate max-w-[180px] group-hover:text-gold transition-colors">
                          {row.client_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">{row.nik || '—'}</span>
                      </div>
                    </td>

                    {/* Katalog */}
                    <td className="px-5 py-2.5">
                      <span className="inline-block rounded-md bg-navy/5 px-2 py-0.5 text-[10px] font-black text-navy uppercase tracking-wide border border-navy/10">
                        {row.catalog_code}
                      </span>
                    </td>

                    {/* Tanggal Masuk */}
                    <td className="px-5 py-2.5">
                      <span className="text-[11px] text-slate-500 font-medium">{dateStr}</span>
                    </td>

                    {/* Status Terakhir */}
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', style.dot)} />
                        <span className={cn(
                          'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          style.badge
                        )}>
                          {row.current_milestone}
                        </span>
                        {row.is_vetoed && (
                          <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                        )}
                        {row.is_overdue && (
                          <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Row count footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Menampilkan {filtered.length} dari {statTotal} laporan
            </p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Klik baris untuk membuka Timeline
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
