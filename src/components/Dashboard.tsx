import React from 'react';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarDays,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BulletinBoard } from './BulletinBoard';
import { DashboardCalendar } from './DashboardCalendar';

const CATALOG_COLORS: Record<string, string> = {
  LAN: 'bg-blue-100 text-blue-700',
  CORP: 'bg-violet-100 text-violet-700',
  BANK: 'bg-amber-100 text-amber-700',
  PJJ: 'bg-emerald-100 text-emerald-700',
  FAM: 'bg-rose-100 text-rose-700',
};

const ALL_TIME = {
  total: 1284,
  breakdown: [
    { code: 'LAN', label: 'Pertanahan', count: 412 },
    { code: 'CORP', label: 'Badan Hukum', count: 285 },
    { code: 'BANK', label: 'Perbankan', count: 198 },
    { code: 'PJJ', label: 'Perjanjian', count: 163 },
    { code: 'FAM', label: 'Keluarga & Waris', count: 226 },
  ],
};

const ANNUAL = {
  year: 2026,
  selesai: 389,
  proses: 247,
  trend: '+14%',
  positive: true,
  breakdown: [
    { code: 'LAN', selesai: 128, proses: 82 },
    { code: 'CORP', selesai: 87, proses: 63 },
    { code: 'BANK', selesai: 54, proses: 48 },
    { code: 'PJJ', selesai: 42, proses: 31 },
    { code: 'FAM', selesai: 78, proses: 23 },
  ],
};

const MONTHLY = {
  month: 'Maret 2026',
  selesai: 47,
  proses: 62,
  trend: '-8%',
  positive: false,
  breakdown: [
    { code: 'LAN', selesai: 16, proses: 20 },
    { code: 'CORP', selesai: 10, proses: 15 },
    { code: 'BANK', selesai: 8, proses: 12 },
    { code: 'PJJ', selesai: 6, proses: 8 },
    { code: 'FAM', selesai: 7, proses: 7 },
  ],
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
      {children}
    </p>
  );
}

function CatalogBadge({ code }: { code: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest',
        CATALOG_COLORS[code] ?? 'bg-zinc-100 text-zinc-600'
      )}
    >
      {code}
    </span>
  );
}

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

function AllTimeCard() {
  return (
    <CardShell>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-navy/5 flex items-center justify-center">
            <Layers className="h-4 w-4 text-navy" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Semua Masa
            </p>
            <h3 className="font-black text-navy uppercase tracking-tight" style={{ fontSize: 14 }}>
              Total Klien Selesai
            </h3>
          </div>
        </div>
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
      </div>

      <div>
        <p
          className="font-black text-navy leading-none"
          style={{ fontSize: 40, color: '#0F172A' }}
        >
          {ALL_TIME.total.toLocaleString('id-ID')}
        </p>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
          Klien Terselesaikan
        </p>
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <SectionLabel>Breakdown per Katalog</SectionLabel>
        <div className="space-y-1.5">
          {ALL_TIME.breakdown.map((b) => (
            <div key={b.code} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CatalogBadge code={b.code} />
                <span className="text-[10px] text-slate-500 font-medium">{b.label}</span>
              </div>
              <span className="text-[11px] font-black text-navy" style={{ color: '#C2A35D' }}>
                {b.count.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function AnnualCard() {
  return (
    <CardShell>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gold/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tahun {ANNUAL.year}
            </p>
            <h3 className="font-black text-navy uppercase tracking-tight" style={{ fontSize: 14 }}>
              Performa Tahun Berjalan
            </h3>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg',
            ANNUAL.positive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
          )}
        >
          {ANNUAL.positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {ANNUAL.trend}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
            Selesai
          </p>
          <p className="text-2xl font-black text-emerald-700 leading-none">{ANNUAL.selesai}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
            Proses
          </p>
          <p className="text-2xl font-black text-amber-700 leading-none">{ANNUAL.proses}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <SectionLabel>Breakdown per Katalog</SectionLabel>
        <div className="space-y-1.5">
          {ANNUAL.breakdown.map((b) => (
            <div key={b.code} className="flex items-center justify-between">
              <CatalogBadge code={b.code} />
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="text-emerald-600">{b.selesai} selesai</span>
                <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                <span className="text-amber-600">{b.proses} proses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function MonthlyCard() {
  return (
    <CardShell>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {MONTHLY.month}
            </p>
            <h3 className="font-black text-navy uppercase tracking-tight" style={{ fontSize: 14 }}>
              Aktivitas Bulan Ini
            </h3>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg',
            MONTHLY.positive ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
          )}
        >
          {MONTHLY.positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {MONTHLY.trend}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
            Selesai
          </p>
          <p className="text-2xl font-black text-emerald-700 leading-none">{MONTHLY.selesai}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
            Proses
          </p>
          <p className="text-2xl font-black text-blue-700 leading-none">{MONTHLY.proses}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <SectionLabel>Breakdown per Katalog</SectionLabel>
        <div className="space-y-1.5">
          {MONTHLY.breakdown.map((b) => (
            <div key={b.code} className="flex items-center justify-between">
              <CatalogBadge code={b.code} />
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="text-emerald-600">{b.selesai} selesai</span>
                <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                <span className="text-blue-600">{b.proses} proses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

export const Dashboard: React.FC<{ role: string; authorName?: string }> = ({
  role,
  authorName = 'Notaris',
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-navy uppercase tracking-tight">
          Notary <span style={{ color: '#C2A35D' }}>Command Center</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
          Ringkasan Statistik & Pengumuman Internal
        </p>
      </div>

      {/* 2-Column Grid — Left: 3 Recap Cards | Right: Bulletin Board */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN — 3 Recapitulation Cards */}
        <div className="space-y-4">
          <AllTimeCard />
          <AnnualCard />
          <MonthlyCard />
        </div>

        {/* RIGHT COLUMN — Bulletin Board + Calendar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <BulletinBoard role={role} authorName={authorName} />
          </div>
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
};
