import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, QrCode, Camera, ArrowRight, User, Loader2, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { cn } from '../lib/utils';

type Consumer = {
  id: string;
  client_name: string;
  nik: string;
  phone: string;
  catalog_code: string;
  current_milestone: string;
  progress_pct: number;
};

type TabType = 'manual' | 'scan';
type ScanMode = 'camera' | 'upload';

export const UpdateAccess: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [query, setQuery] = useState('');
  const [allConsumers, setAllConsumers] = useState<Consumer[]>([]);
  const [results, setResults] = useState<Consumer[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSuccess, setScanSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [loadingConsumers, setLoadingConsumers] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchConsumers();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchConsumers = async () => {
    setLoadingConsumers(true);
    try {
      const res = await fetch('/api/consumers');
      if (res.ok) {
        const data = await res.json();
        setAllConsumers(data.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoadingConsumers(false);
    }
  };

  const doSearch = useCallback((q: string, consumers: Consumer[]) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase().trim();
    const matched = consumers.filter(c =>
      c.nik?.toLowerCase().includes(lower) ||
      c.phone?.toLowerCase().includes(lower) ||
      c.id?.toLowerCase().includes(lower) ||
      c.client_name?.toLowerCase().includes(lower)
    );
    setResults(matched.slice(0, 6));
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedConsumer(null);
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(val, allConsumers);
      setIsSearching(false);
    }, 300);
  };

  const handleSelect = (consumer: Consumer) => {
    setSelectedConsumer(consumer);
    setQuery(consumer.client_name);
    setResults([]);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedConsumer(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'manual') {
      stopCamera();
    }
    setScanError('');
    setScanSuccess('');
  };

  const handleScanResult = (decodedText: string) => {
    stopCamera();
    const consumer = allConsumers.find(
      c => c.id === decodedText || c.nik === decodedText || c.phone === decodedText
    );
    if (consumer) {
      setSelectedConsumer(consumer);
      setScanSuccess(`Konsumen ditemukan: ${consumer.client_name}`);
      setScanError('');
    } else {
      setScanError(`QR Code tidak dikenali: "${decodedText}". Pastikan QR Code berasal dari sistem NotarisHub.`);
      setScanSuccess('');
    }
  };

  const startCamera = async () => {
    setScanError('');
    setScanSuccess('');
    try {
      const deviceList = await Html5Qrcode.getCameras();
      if (!deviceList || deviceList.length === 0) {
        setScanError('Tidak ada kamera yang ditemukan. Pastikan izin kamera telah diberikan.');
        return;
      }
      setCameras(deviceList);
      const camId = selectedCamera || deviceList[0].id;
      setSelectedCamera(camId);

      html5QrcodeRef.current = new Html5Qrcode('qr-reader');
      await html5QrcodeRef.current.start(
        camId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        handleScanResult,
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      setScanError('Gagal mengakses kamera. Periksa izin browser Anda.');
    }
  };

  const stopCamera = async () => {
    if (html5QrcodeRef.current && isCameraActive) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch {}
    }
    setIsCameraActive(false);
  };

  const handleCameraSwitch = async (cameraId: string) => {
    setSelectedCamera(cameraId);
    if (isCameraActive) {
      await stopCamera();
      setTimeout(() => {
        startCamera();
      }, 400);
    }
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanError('File harus berupa gambar (PNG, JPG, dll).');
      return;
    }
    setScanError('');
    setScanSuccess('');
    try {
      const scanner = new Html5Qrcode('qr-reader-upload');
      const result = await scanner.scanFile(file, true);
      scanner.clear();
      handleScanResult(result);
    } catch {
      setScanError('QR Code tidak dapat dibaca dari gambar ini. Pastikan gambar memiliki kualitas yang baik.');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleProceed = () => {
    if (selectedConsumer) {
      navigate(`/direktori/${selectedConsumer.id}`);
    }
  };

  const milestoneColor = (milestone: string) => {
    const map: Record<string, string> = {
      'Selesai': 'text-emerald-600 bg-emerald-50',
      'Validasi Pajak': 'text-amber-600 bg-amber-50',
      'Plotting': 'text-blue-600 bg-blue-50',
      'Tanda Tangan': 'text-violet-600 bg-violet-50',
      'Minuta': 'text-orange-600 bg-orange-50',
    };
    return map[milestone] || 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-gold to-[#8B7344] shadow-lg shadow-gold/20 mb-5">
            <Search className="h-8 w-8 text-navy" />
          </div>
          <h1 className="text-xl font-black text-navy uppercase tracking-tight">Update Ajuan</h1>
          <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
            Cari konsumen untuk membuka Timeline Progress
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-[28px] ring-1 ring-gold/10 overflow-hidden shadow-xl"
        >
          {/* Tab Bar */}
          <div className="flex border-b border-zinc-100">
            <button
              onClick={() => handleTabChange('manual')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300",
                activeTab === 'manual'
                  ? "text-gold border-b-2 border-gold bg-gold/5"
                  : "text-slate-400 hover:text-slate-600 hover:bg-zinc-50"
              )}
            >
              <Search className="h-4 w-4" />
              <span>Pencarian Manual</span>
            </button>
            <button
              onClick={() => handleTabChange('scan')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300",
                activeTab === 'scan'
                  ? "text-gold border-b-2 border-gold bg-gold/5"
                  : "text-slate-400 hover:text-slate-600 hover:bg-zinc-50"
              )}
            >
              <QrCode className="h-4 w-4" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* ── MANUAL SEARCH TAB ── */}
              {activeTab === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Cari berdasarkan NIK, Kode Ajuan, atau Nomor Telepon
                  </p>

                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      {isSearching
                        ? <Loader2 className="h-4 w-4 text-gold animate-spin" />
                        : <Search className="h-4 w-4 text-slate-400" />
                      }
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={handleQueryChange}
                      placeholder="Ketik NIK, Kode Ajuan, atau No. Telp..."
                      className="w-full pl-11 pr-10 py-4 rounded-2xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all outline-none"
                    />
                    {query && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Live Results */}
                  <AnimatePresence>
                    {results.length > 0 && !selectedConsumer && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 rounded-2xl border border-zinc-100 shadow-lg overflow-hidden bg-white"
                      >
                        {results.map((c, i) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelect(c)}
                            className={cn(
                              "w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gold/5 transition-colors",
                              i < results.length - 1 && "border-b border-zinc-50"
                            )}
                          >
                            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-navy truncate uppercase">{c.client_name}</p>
                              <p className="text-[10px] font-medium text-slate-400 mt-0.5">NIK: {c.nik} · {c.phone}</p>
                            </div>
                            <span className={cn(
                              "shrink-0 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg",
                              milestoneColor(c.current_milestone)
                            )}>
                              {c.current_milestone}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {query.trim() && !isSearching && results.length === 0 && !selectedConsumer && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100"
                      >
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                          Data tidak ditemukan. Periksa kembali input Anda.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selected Consumer Preview */}
                  <AnimatePresence>
                    {selectedConsumer && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 rounded-2xl bg-gradient-to-br from-gold/5 to-amber-50/50 border border-gold/20 p-5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-gold/20 to-amber-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-navy uppercase tracking-tight truncate">
                              {selectedConsumer.client_name}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                              NIK: {selectedConsumer.nik}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400">
                              Telp: {selectedConsumer.phone}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</p>
                            <p className="text-sm font-black text-gold">{selectedConsumer.progress_pct}%</p>
                            <span className={cn(
                              "inline-block text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg mt-1",
                              milestoneColor(selectedConsumer.current_milestone)
                            )}>
                              {selectedConsumer.current_milestone}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ── QR SCAN TAB ── */}
              {activeTab === 'scan' && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Scan Mode Toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => { setScanMode('camera'); stopCamera(); setScanError(''); setScanSuccess(''); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border",
                        scanMode === 'camera'
                          ? "bg-navy text-white border-navy shadow-md"
                          : "bg-white text-slate-400 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Kamera</span>
                    </button>
                    <button
                      onClick={() => { setScanMode('upload'); stopCamera(); setScanError(''); setScanSuccess(''); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border",
                        scanMode === 'upload'
                          ? "bg-navy text-white border-navy shadow-md"
                          : "bg-white text-slate-400 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Gambar</span>
                    </button>
                  </div>

                  {/* ── CAMERA MODE ── */}
                  {scanMode === 'camera' && (
                    <div className="space-y-4">
                      {/* Camera Viewport */}
                      <div
                        id="qr-reader"
                        className={cn(
                          "w-full rounded-2xl overflow-hidden border-2 transition-all duration-300 min-h-[220px] flex items-center justify-center",
                          isCameraActive ? "border-gold/40 bg-black" : "border-dashed border-zinc-200 bg-zinc-50"
                        )}
                      >
                        {!isCameraActive && (
                          <div className="flex flex-col items-center gap-3 p-8 text-center">
                            <Camera className="h-10 w-10 text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Kamera belum aktif
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Camera Selector */}
                      {cameras.length > 1 && (
                        <select
                          value={selectedCamera}
                          onChange={(e) => handleCameraSwitch(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-xs font-medium text-navy focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all"
                        >
                          {cameras.map(cam => (
                            <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
                          ))}
                        </select>
                      )}

                      {/* Camera Controls */}
                      <div className="flex gap-3">
                        {!isCameraActive ? (
                          <button
                            onClick={startCamera}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-navy text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1E293B] transition-all hover:scale-[1.01] active:scale-95 shadow-lg"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Mulai Kamera</span>
                          </button>
                        ) : (
                          <button
                            onClick={stopCamera}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                          >
                            <X className="h-4 w-4" />
                            <span>Hentikan Kamera</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── UPLOAD MODE ── */}
                  {scanMode === 'upload' && (
                    <div className="space-y-4">
                      {/* Hidden upload viewport needed by html5-qrcode */}
                      <div id="qr-reader-upload" className="hidden" />

                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "w-full rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300",
                          isDragging
                            ? "border-gold bg-gold/5 scale-[1.01]"
                            : "border-zinc-200 bg-zinc-50 hover:border-gold/50 hover:bg-gold/5"
                        )}
                      >
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                          isDragging ? "bg-gold/20" : "bg-zinc-200"
                        )}>
                          <QrCode className={cn("h-7 w-7 transition-colors", isDragging ? "text-gold" : "text-slate-400")} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black text-navy uppercase tracking-tight">
                            Drag & Drop Gambar QR Code
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1">
                            atau klik untuk memilih file (PNG, JPG)
                          </p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </div>
                  )}

                  {/* Scan Feedback */}
                  <AnimatePresence>
                    {scanError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100"
                      >
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide leading-relaxed">{scanError}</p>
                      </motion.div>
                    )}
                    {scanSuccess && selectedConsumer && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">QR Berhasil Dibaca</p>
                            <p className="text-xs font-black text-navy uppercase mt-0.5">{selectedConsumer.client_name}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer: CTA Button */}
          <div className="px-8 pb-8">
            <motion.button
              onClick={handleProceed}
              disabled={!selectedConsumer}
              whileHover={selectedConsumer ? { scale: 1.01 } : {}}
              whileTap={selectedConsumer ? { scale: 0.97 } : {}}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg",
                selectedConsumer
                  ? "bg-gold hover:bg-[#B19251] text-navy shadow-gold/25"
                  : "bg-zinc-100 text-slate-300 cursor-not-allowed shadow-none"
              )}
            >
              <span>Lanjutkan ke Timeline</span>
              <ArrowRight className={cn(
                "h-4 w-4 transition-transform",
                selectedConsumer && "group-hover:translate-x-1"
              )} />
            </motion.button>
            {!selectedConsumer && (
              <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-3">
                Identifikasi konsumen terlebih dahulu untuk melanjutkan
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
