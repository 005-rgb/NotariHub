import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Printer,
  ChevronDown,
  Users2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { FolderListItem, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ConsumerDirectoryProps {
  profile: UserProfile | null;
}

const CATALOG_OPTIONS = ['Semua Katalog', 'AJB', 'APHT', 'SKMHT', 'FIDUSIA', 'WASIAT'];
const MILESTONE_COLOR: Record<string, string> = {
  'Selesai': 'bg-emerald-100 text-emerald-700',
  'Tanda Tangan': 'bg-blue-100 text-blue-700',
  'Validasi Pajak': 'bg-amber-100 text-amber-700',
  'Plotting': 'bg-violet-100 text-violet-700',
  'Minuta': 'bg-slate-100 text-slate-600',
};
const ROW_HEIGHT = 52;
const TABLE_HEADER_HEIGHT = 40;

const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="grid items-center border-b border-zinc-100 px-6"
    style={{
      gridTemplateColumns: '80px 1fr 140px 110px 160px 120px 108px',
      height: ROW_HEIGHT,
      opacity: 1 - index * 0.12,
    }}
  >
    {[40, 120, 90, 70, 100, 80, 60].map((w, i) => (
      <div key={i} className="flex items-center">
        <div
          className="h-3 rounded-full bg-zinc-100 animate-pulse"
          style={{ width: w }}
        />
      </div>
    ))}
  </div>
);

interface RowData {
  items: FolderListItem[];
  isNotaris: boolean;
  onNavigate: (item: FolderListItem) => void;
  onWhatsApp: (item: FolderListItem) => void;
  onPrint: (item: FolderListItem) => void;
}

const TableRow: React.FC<ListChildComponentProps<RowData>> = ({ index, style, data }) => {
  const { items, isNotaris, onNavigate, onWhatsApp, onPrint } = data;
  const item = items[index];
  if (!item) return null;

  const milestoneClass = MILESTONE_COLOR[item.current_milestone] || 'bg-zinc-100 text-zinc-600';
  const shortId = item.id.replace('uuid-', '#').toUpperCase();
  const dateStr = new Date(item.created_at).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="group grid items-center border-b border-zinc-100 px-6 hover:bg-slate-50 transition-colors cursor-default"
      style={{
        ...style,
        gridTemplateColumns: '80px 1fr 140px 110px 160px 120px 108px',
      }}
    >
      {/* ID */}
      <div className="text-[11px] font-bold text-slate-400 font-mono tracking-tight">{shortId}</div>

      {/* Nama Konsumen */}
      <div className="flex flex-col min-w-0 pr-4">
        <button
          onClick={() => onNavigate(item)}
          className="text-xs font-bold text-navy hover:text-gold transition-colors text-left truncate uppercase tracking-tight flex items-center gap-1 group/name"
        >
          <span className="truncate">{item.client_name}</span>
          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 group-hover/name:opacity-60 transition-opacity" />
        </button>
        <span className="text-[10px] text-slate-400 font-medium truncate">{item.nik || '—'}</span>
      </div>

      {/* No HP */}
      <div className="text-xs font-medium text-slate-600 font-mono">{item.phone || '—'}</div>

      {/* Katalog */}
      <div>
        <span className="inline-block rounded-md bg-navy/8 px-2 py-0.5 text-[10px] font-black text-navy uppercase tracking-wide border border-navy/10">
          {item.catalog_code}
        </span>
      </div>

      {/* Status Progres */}
      <div className="flex items-center gap-2">
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', milestoneClass)}>
          {item.current_milestone}
        </span>
        {item.is_vetoed && (
          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
        )}
      </div>

      {/* Tanggal */}
      <div className="text-[11px] text-slate-500 font-medium">{dateStr}</div>

      {/* Aksi */}
      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onNavigate(item)}
          title="Lihat Profil"
          className="p-1.5 rounded-lg hover:bg-gold/10 text-gold transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onWhatsApp(item)}
          title="Kirim WhatsApp"
          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPrint(item)}
          title="Cetak"
          className="p-1.5 rounded-lg hover:bg-zinc-100 text-slate-500 transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ConsumerDirectory: React.FC<ConsumerDirectoryProps> = ({ profile }) => {
  const [allData, setAllData] = useState<FolderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('Semua Katalog');
  const [yearFilter, setYearFilter] = useState('Semua Tahun');
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const isNotaris = profile?.role === 'NOTARIS';

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await NotaryHttpClient.get('/api/consumers');
        if (res.ok) {
          const result = await res.json();
          setAllData(result.data);
        }
      } catch (err) {
        console.error('[ConsumerDirectory] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set(allData.map(d => new Date(d.created_at).getFullYear().toString()));
    return ['Semua Tahun', ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, [allData]);

  const filteredData = useMemo(() => {
    let result = [...allData];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(d => d.client_name.toLowerCase().includes(q));
    }

    if (catalogFilter !== 'Semua Katalog') {
      result = result.filter(d => d.catalog_code === catalogFilter);
    }

    if (yearFilter !== 'Semua Tahun') {
      result = result.filter(d =>
        new Date(d.created_at).getFullYear().toString() === yearFilter
      );
    }

    result.sort((a, b) => a.client_name.localeCompare(b.client_name, 'id'));

    return result;
  }, [allData, search, catalogFilter, yearFilter]);

  const handleNavigate = useCallback((item: FolderListItem) => {
    navigate(`/direktori/${item.id}`);
  }, [navigate]);

  const handleWhatsApp = useCallback((item: FolderListItem) => {
    const phone = item.phone?.replace(/^0/, '62') || '';
    const msg = encodeURIComponent(`Yth. Bapak/Ibu ${item.client_name}, berkas ${item.catalog_code} Anda saat ini berada di tahap: ${item.current_milestone}.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }, []);

  const handlePrint = useCallback((item: FolderListItem) => {
    window.print();
  }, []);

  const rowData: RowData = useMemo(() => ({
    items: filteredData,
    isNotaris,
    onNavigate: handleNavigate,
    onWhatsApp: handleWhatsApp,
    onPrint: handlePrint,
  }), [filteredData, isNotaris, handleNavigate, handleWhatsApp, handlePrint]);

  const clearSearch = () => {
    setSearch('');
    searchRef.current?.focus();
  };

  const statSelesai = useMemo(() => allData.filter(d => d.current_milestone === 'Selesai').length, [allData]);
  const statOverdue = useMemo(() => allData.filter(d => d.is_overdue).length, [allData]);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gold/10 flex items-center justify-center">
              <Users2 className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="text-xl font-black text-navy uppercase tracking-tight">Direktori Konsumen</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Total {allData.length} Konsumen Terdaftar
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Selesai</p>
              <p className="text-sm font-black text-emerald-700">{statSelesai}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
            <Clock className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Overdue</p>
              <p className="text-sm font-black text-red-600">{statOverdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama konsumen…"
            className="w-full pl-9 pr-8 py-2.5 text-xs font-medium text-navy bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition-colors"
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
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Tahun Filter */}
        <div className="relative">
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 text-xs font-bold text-navy bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all cursor-pointer"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Results count */}
        {!loading && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            {filteredData.length} hasil
          </span>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl ring-1 ring-gold/10 overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Table Header */}
        <div
          className="grid items-center border-b border-zinc-100 bg-zinc-50/80 px-6 shrink-0"
          style={{
            gridTemplateColumns: '80px 1fr 140px 110px 160px 120px 108px',
            height: TABLE_HEADER_HEIGHT,
          }}
        >
          {['ID', 'Nama Konsumen', 'No HP', 'Katalog', 'Status Progres', 'Tanggal Masuk', 'Aksi'].map(col => (
            <div
              key={col}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Virtual Body */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} index={i} />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                <Users2 className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-navy uppercase tracking-tight">Tidak Ada Hasil</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau filter pencarian Anda.</p>
            </div>
          ) : (
            <AutoSizer
              renderProp={({ height, width }) => (
                <List
                  height={height ?? 400}
                  width={width ?? 800}
                  itemCount={filteredData.length}
                  itemSize={ROW_HEIGHT}
                  itemData={rowData}
                  overscanCount={8}
                >
                  {TableRow}
                </List>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};
