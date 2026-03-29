import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  RotateCcw, 
  ChevronRight, 
  MoreVertical,
  ArrowUpRight,
  Zap,
  Lock
} from 'lucide-react';
import { HorizontalStepper } from './HorizontalStepper';
import { RollbackModal } from './RollbackModal';
import { FolderList } from './FolderList';
import { HistoryTimeline } from './HistoryTimeline';
import { TargetSetter } from './TargetSetter';
import { FeatureGate } from './FeatureGate';
import { FolderActivity } from '../types';
import { cn } from '../lib/utils';

// Mock Activities
const MOCK_ACTIVITIES: FolderActivity[] = [
  {
    id: 'act-1',
    user_id: 'user-1',
    user_name: 'Siti Aminah',
    user_role: 'STAF_UTAMA',
    folder_id: 'folder-1',
    action_type: 'ASSET_UPLOAD',
    asset_name: 'PBB_2025_Budi.pdf',
    payload_change: { description: 'Uploaded PBB 2025' },
    created_at: new Date(Date.now() - 300000).toISOString(), // 5m ago
  },
  {
    id: 'act-2',
    user_id: 'user-2',
    user_name: 'Notaris Jakarta',
    user_role: 'NOTARIS',
    folder_id: 'folder-1',
    action_type: 'STATUS_ROLLBACK',
    payload_change: { 
      description: 'Rolled back status to Milestone 3',
      reason: 'Dokumen PPH belum tervalidasi dengan benar.' 
    },
    created_at: new Date(Date.now() - 1200000).toISOString(), // 20m ago
  },
  {
    id: 'act-3',
    user_id: 'user-3',
    user_name: 'Budi Santoso',
    user_role: 'STAF_LAPANGAN',
    folder_id: 'folder-1',
    action_type: 'VERIFICATION',
    payload_change: { description: 'Verified location plotting' },
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1h ago
  },
  {
    id: 'act-4',
    user_id: 'user-2',
    user_name: 'Notaris Jakarta',
    user_role: 'NOTARIS',
    folder_id: 'folder-1',
    action_type: 'SIGNING',
    payload_change: { description: 'Signed AJB Minuta' },
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2h ago
  }
];

// Mock Data for 6 Rumpun
const RUMPUN_DATA = [
  { name: 'Pertanahan', count: 45, color: '#C2A35D' },
  { name: 'Korporasi', count: 32, color: '#0F172A' },
  { name: 'Jaminan', count: 28, color: '#64748B' },
  { name: 'Keluarga', count: 18, color: '#94A3B8' },
  { name: 'Umum', count: 12, color: '#CBD5E1' },
  { name: 'Admin', count: 8, color: '#E2E8F0' },
];

const VOLUME_DATA = [
  { date: '01 Mar', volume: 12 },
  { date: '05 Mar', volume: 18 },
  { date: '10 Mar', volume: 15 },
  { date: '15 Mar', volume: 22 },
  { date: '20 Mar', volume: 30 },
  { date: '25 Mar', volume: 28 },
  { date: '29 Mar', volume: 35 },
];

const STEPS = [
  { id: '1', name: 'Verifikasi', note: 'Dokumen identitas telah divalidasi oleh Staf Utama.' },
  { id: '2', name: 'Plotting', note: 'Lokasi objek telah dipetakan melalui BPN Online.' },
  { id: '3', name: 'Validasi Pajak', note: 'PPH & BPHTB telah disetujui oleh kantor pajak.' },
  { id: '4', name: 'Minuta', note: 'Draf akta telah siap untuk pembacaan.' },
  { id: '5', name: 'Tanda Tangan', note: 'Penandatanganan dijadwalkan besok pukul 10:00.' },
  { id: '6', name: 'Balik Nama', note: 'Proses pendaftaran ke BPN sedang berjalan.' },
  { id: '7', name: 'Selesai', note: 'Sertifikat siap diserahkan ke klien.' },
];

export const PremiumDashboard: React.FC<{ role: string }> = ({ role }) => {
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [targetDate, setTargetDate] = useState<string | undefined>(new Date(Date.now() + 345600000).toISOString());
  const [isOverdue, setIsOverdue] = useState(false);
  const isNotary = role === 'NOTARIS';

  const handleTargetUpdate = (newDate: string, overdue: boolean) => {
    setTargetDate(newDate);
    setIsOverdue(overdue);
  };

  return (
    <div className="flex -mx-8 -my-8 h-[calc(100vh-64px)] overflow-hidden">
      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-navy uppercase">
                Notary <span className="text-gold">Command Center</span>
              </h1>
              <FeatureGate feature="white-label">
                <div className="flex items-center gap-1.5 bg-gold/10 text-gold px-3 py-1 rounded-full border border-gold/20 animate-pulse">
                  <Zap className="h-3 w-3 fill-gold" />
                  <span className="text-[9px] font-black uppercase tracking-widest">White-Label Active</span>
                </div>
              </FeatureGate>
            </div>
            <p className="text-sm font-medium text-slate">
              Premium Oversight & Legal Workflow Management
            </p>
          </div>
          
          {isNotary && (
            <button 
              onClick={() => setIsRollbackOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-black text-white shadow-2xl transition-all hover:bg-zinc-800 hover:scale-[1.02] gold-glow"
            >
              <RotateCcw className="h-4 w-4 text-gold" />
              <span className="uppercase tracking-widest">Veto Status Rollback</span>
            </button>
          )}
        </div>

        {/* Target Setter Section */}
        <TargetSetter 
          folderId="folder-1"
          initialTargetDate={targetDate}
          isOverdue={isOverdue}
          userRole={role}
          onUpdate={handleTargetUpdate}
        />

        {/* Active Workflow Card */}
        <div className="glass-card rounded-3xl p-6 ring-1 ring-gold/10">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-gold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy uppercase tracking-tight">
                  Active Case: <span className="text-gold">AJB Budi Santoso</span>
                </h3>
                <p className="text-xs font-bold text-slate uppercase tracking-widest">
                  Rumpun Pertanahan • Milestone 5/7
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                On Track
              </span>
              <button className="rounded-lg p-2 text-slate hover:bg-zinc-100">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <HorizontalStepper 
            steps={STEPS} 
            currentStepId="5" 
            isVetoed={false} 
          />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Line Chart: Volume */}
          <div className="glass-card rounded-3xl p-6 ring-1 ring-gold/10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-gold" />
                <h3 className="text-sm font-semibold text-navy uppercase tracking-widest">
                  Volume Ajuan (30 Hari)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-500">+12% vs last month</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VOLUME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 700 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: 700
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#C2A35D" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#C2A35D', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Distribution */}
          <div className="glass-card rounded-3xl p-6 ring-1 ring-gold/10">
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-5 w-5 text-gold" />
              <h3 className="text-sm font-semibold text-navy uppercase tracking-widest">
                Distribusi 6 Rumpun
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RUMPUN_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#0F172A', fontWeight: 800 }} 
                    width={80}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                    {RUMPUN_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Paginated Folder List Section */}
        <FolderList />
      </div>

      {/* Right Sidebar: History Timeline */}
      <div className="hidden xl:block">
        <HistoryTimeline activities={MOCK_ACTIVITIES} />
      </div>

      {/* Veto Modal */}
      <RollbackModal 
        isOpen={isRollbackOpen}
        onClose={() => setIsRollbackOpen(false)}
        folderId="folder-1"
        folderName="AJB Budi Santoso"
        targetMilestoneId="3"
        targetMilestoneName="Validasi Pajak"
        onSuccess={() => alert('Veto Successful')}
      />
    </div>
  );
};
