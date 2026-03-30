import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const LIBUR_NASIONAL: Record<string, string> = {
  '2026-01-01': 'Tahun Baru Masehi 2026',
  '2026-01-27': "Isra Mi'raj Nabi Muhammad SAW 1447 H",
  '2026-01-29': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-20': 'Idul Fitri 1447 H — 1 Syawal',
  '2026-03-21': 'Idul Fitri 1447 H — 2 Syawal',
  '2026-03-28': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
  '2026-04-02': 'Wafat Isa Al-Masih (Good Friday)',
  '2026-04-04': 'Hari Paskah',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Isa Al-Masih',
  '2026-05-20': 'Hari Raya Waisak 2570 BE',
  '2026-05-27': 'Idul Adha 1447 H',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-17': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan Republik Indonesia',
  '2026-08-26': 'Maulid Nabi Muhammad SAW 1448 H',
  '2026-12-25': 'Hari Raya Natal',
  '2026-12-26': 'Cuti Bersama Hari Raya Natal',
};

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DashboardCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [tooltip, setTooltip] = useState<{ key: string; text: string } | null>(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const getDayOfWeek = (day: number) => new Date(viewYear, viewMonth, day).getDay();
  const isSunday = (day: number) => getDayOfWeek(day) === 0;
  const getHoliday = (day: number) => LIBUR_NASIONAL[toKey(viewYear, viewMonth, day)] ?? null;
  const isRed = (day: number) => isSunday(day) || !!getHoliday(day);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-navy transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <p className="font-black text-navy uppercase tracking-tight" style={{ fontSize: 14 }}>
          {BULAN[viewMonth]} {viewYear}
        </p>

        <button
          onClick={nextMonth}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-navy transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week Headers */}
      <div className="grid grid-cols-7 mb-1.5">
        {HARI.map((h, i) => (
          <div
            key={h}
            className={cn(
              'text-center font-black uppercase tracking-widest py-1',
              i === 0 ? 'text-red-400' : 'text-slate-400'
            )}
            style={{ fontSize: 10 }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-8" />;

          const cellKey = toKey(viewYear, viewMonth, day);
          const holiday = getHoliday(day);
          const red = isRed(day);
          const todayMark = isToday(day);
          const isHovered = tooltip?.key === cellKey;

          return (
            <div
              key={cellKey}
              className="relative flex items-center justify-center h-8"
              onMouseEnter={() => holiday ? setTooltip({ key: cellKey, text: holiday }) : undefined}
              onMouseLeave={() => setTooltip(null)}
            >
              <span
                className={cn(
                  'h-7 w-7 flex items-center justify-center rounded-full',
                  'font-bold select-none transition-all duration-150',
                  todayMark
                    ? 'font-black text-white'
                    : red
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-navy hover:bg-slate-50'
                )}
                style={{
                  fontSize: 12,
                  ...(todayMark ? { backgroundColor: '#C2A35D' } : {}),
                }}
              >
                {day}
              </span>

              {/* Libur indicator dot (non-Sunday holidays) */}
              {holiday && !isSunday(day) && !todayMark && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-red-400"
                />
              )}

              {/* Tooltip */}
              {isHovered && holiday && (
                <div
                  className="absolute z-50 pointer-events-none"
                  style={{ bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <div
                    className="whitespace-nowrap text-white rounded-lg px-2.5 py-1.5 shadow-xl"
                    style={{ backgroundColor: '#0F172A', fontSize: 10, fontWeight: 700 }}
                  >
                    {holiday}
                  </div>
                  <div
                    className="w-2 h-2 rotate-45 mx-auto -mt-1"
                    style={{ backgroundColor: '#0F172A' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span
            className="h-5 w-5 rounded-full flex items-center justify-center text-white font-black"
            style={{ backgroundColor: '#C2A35D', fontSize: 9 }}
          >
            {today.getDate()}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-red-500">31</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Libur / Minggu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hari Nasional</span>
        </div>
      </div>
    </div>
  );
}
