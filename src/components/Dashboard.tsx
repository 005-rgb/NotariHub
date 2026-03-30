import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  MoreVertical, 
  Calendar, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Search
} from 'lucide-react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { FolderListItem, PaginatedResponse } from '../types';
import { cn } from '../lib/utils';
import { useUi } from '../context/UiContext';

export const Dashboard: React.FC<{ role: string }> = ({ role }) => {
  const [data, setData] = useState<PaginatedResponse<FolderListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { setIsConsumerDrawerOpen, setSelectedConsumer } = useUi();

  const handleConsumerClick = (folder: FolderListItem) => {
    setSelectedConsumer(folder);
    setIsConsumerDrawerOpen(true);
  };

  const fetchFolders = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await NotaryHttpClient.get(`/api/folders?page=${pageNum}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders(page);
  }, [page]);

  const totalPages = data ? Math.ceil(data.total_records / 10) : 0;

  const filteredData = useMemo(() => {
    const raw = data?.data ?? [];
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? raw.filter(folder => folder.client_name.toLowerCase().indexOf(q) === 0)
      : raw;
    return [...filtered].sort((a, b) =>
      a.client_name.localeCompare(b.client_name, 'id', { sensitivity: 'base' })
    );
  }, [data, searchQuery]);

  const stats = [
    { label: 'Total Klien', value: '1,284', icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Total Layanan', value: '452', icon: Briefcase, color: 'bg-gold', trend: '+5%' },
    { label: 'Total Selesai', value: '389', icon: CheckCircle2, color: 'bg-emerald-500', trend: '+18%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy uppercase tracking-tight">
            Notary <span className="text-gold">Command Center</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">
            Premium Oversight & Legal Workflow Management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari berkas..." 
              className="pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all w-64"
            />
          </div>
        </div>
      </div>

      {/* Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-navy uppercase tracking-tight">{stat.label}</h3>
              <p className="text-2xl font-black text-navy mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 px-8 py-6">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-tight">Data Konsumen</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {searchQuery
                ? `${filteredData.length} hasil ditemukan`
                : `Total: ${data?.total_records || 0} Records`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-lg p-2 text-slate-400 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-black text-navy uppercase tracking-widest">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="rounded-lg p-2 text-slate-400 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-4">No</th>
                <th className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Konsumen</span>
                    <div className="relative">
                      <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 14, height: 14 }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari Nama (Contoh: Budi...)"
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-normal normal-case tracking-normal"
                        style={{ fontSize: 12 }}
                      />
                    </div>
                  </div>
                </th>
                <th className="px-8 py-4">Jenis Katalog</th>
                <th className="px-8 py-4">Tanggal Masuk</th>
                <th className="px-8 py-4">Target Selesai</th>
                <th className="px-8 py-4">Status Step</th>
                <th className="px-8 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-gold" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-slate-200" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tidak ada konsumen dengan awalan "{searchQuery}"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.map((folder, idx) => (
                <tr key={folder.id} className="group hover:bg-zinc-50/50 transition-colors text-xs">
                  <td className="px-8 py-2 text-slate-400 font-medium">{(page - 1) * 10 + idx + 1}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleConsumerClick(folder)}
                      className="text-left group/btn"
                    >
                      <p className="font-bold text-navy uppercase tracking-tight group-hover/btn:text-gold transition-colors">{folder.client_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{folder.nik || 'NIK Belum Terdata'}</p>
                    </button>
                  </td>
                  <td className="px-8 py-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3 text-gold" />
                      <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-navy uppercase tracking-widest">
                        {folder.catalog_code}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-2 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-300" />
                      {new Date(folder.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-2">
                    <div className={cn(
                      "font-bold",
                      folder.is_overdue ? "text-red-500" : "text-navy",
                      !folder.is_overdue && folder.target_completion_date && new Date(folder.target_completion_date).getTime() - Date.now() < 86400000 * 2 ? "text-gold" : ""
                    )}>
                      {folder.target_completion_date ? new Date(folder.target_completion_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                  </td>
                  <td className="px-8 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy uppercase tracking-tight">{folder.current_milestone}</span>
                      {folder.is_vetoed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-black text-red-600 uppercase tracking-widest">
                          Vetoed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-2 text-right">
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-zinc-100 hover:text-navy transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
