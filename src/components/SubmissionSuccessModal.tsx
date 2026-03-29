import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CheckCircle2, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { downloadBarcode } from '../lib/barcodeUtils';

interface SubmissionData {
  nama: string;
  nik: string;
  no_wa: string;
  rumpun: string;
  katalog: string;
  kode_ajuan: string;
  notaris_name: string;
  biaya?: string;
  durasi?: string;
  petugas?: string;
}

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SubmissionData | null;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (data) {
      // Re-using downloadBarcode as it captures the element by ID
      downloadBarcode('qr-container', `qr-${data.kode_ajuan}.png`);
    }
  };

  const handleClose = () => {
    onClose();
    // Refresh dashboard logic could be added here if needed, 
    // but usually onClose handles state reset.
    // window.location.reload(); // If a hard refresh is strictly required
  };

  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />

          {/* Modal Content - 600px */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[600px] bg-white rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-zinc-100 text-slate-400 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-sm font-bold text-navy uppercase tracking-tight">Ajuan Berhasil Terkirim</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Data Anda telah masuk ke dalam sistem antrean NotarisHub
                </p>
              </div>

              {/* Data Summary Section - 3 Pilar Style (3 Columns) */}
              <div className="bg-[#F8FAFC] rounded-2xl p-6 mb-8 border border-zinc-100">
                <h3 className="text-sm font-bold text-navy uppercase tracking-tight mb-6 border-b border-zinc-200 pb-3">Ringkasan Data Ajuan</h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-8">
                  {/* Nama Klien */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Nama Klien</p>
                    <p className="text-xs font-medium text-navy uppercase leading-relaxed">{data.nama}</p>
                  </div>
                  
                  {/* Rumpun */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Rumpun</p>
                    <p className="text-xs font-medium text-navy uppercase leading-relaxed">{data.rumpun}</p>
                  </div>

                  {/* Katalog */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Katalog</p>
                    <p className="text-xs font-medium text-navy uppercase leading-relaxed">{data.katalog}</p>
                  </div>

                  {/* Estimasi Biaya */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Estimasi Biaya</p>
                    <p className="text-xs font-bold text-navy leading-relaxed">{data.biaya || 'Rp 0'}</p>
                  </div>

                  {/* Durasi */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Durasi</p>
                    <p className="text-xs font-medium text-navy leading-relaxed">{data.durasi || '-'}</p>
                  </div>

                  {/* Petugas Pemroses */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Petugas</p>
                    <p className="text-xs font-medium text-navy uppercase leading-relaxed">{data.petugas || 'System'}</p>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex items-center justify-between gap-8 bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-8">
                <div 
                  className="flex flex-col items-center flex-1 p-4 rounded-xl border" 
                  id="qr-container"
                  style={{ backgroundColor: '#ffffff', borderColor: '#f8fafc' }}
                >
                  <div className="p-2" style={{ backgroundColor: '#ffffff' }}>
                    <QRCodeCanvas 
                      value={data.kode_ajuan} 
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p 
                    className="text-[10px] font-medium mt-4 uppercase tracking-[0.2em]"
                    style={{ color: '#94a3b8' }}
                  >
                    Kantor Notaris {data.notaris_name}
                  </p>
                </div>
                
                <div className="shrink-0 flex flex-col gap-3">
                  <div className="text-center mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kode Ajuan</p>
                    <p className="text-sm font-black text-gold tracking-tighter">{data.kode_ajuan}</p>
                  </div>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-3 bg-gold hover:bg-[#B19251] text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    <span>💾 Download QR Code</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleClose}
                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
