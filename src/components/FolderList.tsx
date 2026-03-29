import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  RotateCcw, 
  Calendar, 
  Tag,
  Loader2
} from 'lucide-react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { FolderListItem, PaginatedResponse } from '../types';
import { cn } from '../lib/utils';

export const FolderList: React.FC = () => {
  const [data, setData] = useState<PaginatedResponse<FolderListItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="glass-card rounded-3xl overflow-hidden ring-1 ring-gold/10">
      <div className="flex items-center justify-between border-b border-zinc-100 px-8 py-4">
        <div>
          <h3 className="text-sm font-semibold text-navy uppercase tracking-tight">Data Konsumen</h3>
          <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Total: {data?.total_records || 0} Records</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-lg p-1 text-slate hover:bg-zinc-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-black text-navy">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="rounded-lg p-1 text-slate hover:bg-zinc-100 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans">
          <thead>
            <tr className="border-b border-zinc-50 bg-zinc-50/50 text-sm font-semibold text-navy">
              <th className="px-6 py-3">No</th>
              <th className="px-6 py-3">Nama Konsumen</th>
              <th className="px-6 py-3">Jenis Katalog</th>
              <th className="px-6 py-3">Tanggal Masuk</th>
              <th className="px-6 py-3">Target Selesai</th>
              <th className="px-6 py-3">Status Step</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-gold" />
                    <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Loading Records...</p>
                  </div>
                </td>
              </tr>
            ) : data?.data.map((folder, idx) => (
              <tr key={folder.id} className="group hover:bg-zinc-50/50 transition-colors text-xs">
                <td className="px-6 py-2 text-slate font-medium">{(page - 1) * 10 + idx + 1}</td>
                <td className="px-6 py-2">
                  <p className="font-bold text-navy uppercase tracking-tight">{folder.client_name}</p>
                  <p className="text-[10px] text-slate font-medium">{folder.nik || 'NIK Belum Terdata'}</p>
                </td>
                <td className="px-6 py-2">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-navy uppercase">
                    {folder.catalog_code}
                  </span>
                </td>
                <td className="px-6 py-2 text-slate">
                  {new Date(folder.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-2">
                  <div className={cn(
                    "font-bold",
                    folder.is_overdue ? "text-red-500" : "text-navy",
                    !folder.is_overdue && folder.target_completion_date && new Date(folder.target_completion_date).getTime() - Date.now() < 86400000 * 2 ? "text-gold" : ""
                  )}>
                    {folder.target_completion_date ? new Date(folder.target_completion_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </div>
                </td>
                <td className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy">{folder.current_milestone}</span>
                    {folder.is_vetoed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-black text-red-600 uppercase">
                        Vetoed
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-2 text-right">
                  <button className="rounded-lg p-1 text-slate hover:bg-zinc-100 hover:text-navy transition-colors">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
