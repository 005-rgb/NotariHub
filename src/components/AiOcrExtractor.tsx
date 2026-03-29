import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileSearch, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  Save, 
  Image as ImageIcon,
  FileText,
  ScanLine,
  ShieldAlert,
  Zap,
  FileSignature
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useFeatures } from '../context/FeatureContext';
import { cn } from '../lib/utils';
import { OcrResult, UserProfile } from '../types';
import { LegalDraftingTool } from './LegalDraftingTool';

export const AiOcrExtractor: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const { settings, isLoading: featuresLoading } = useFeatures();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDrafting, setShowDrafting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOcrEnabled = settings?.is_ai_ocr_enabled && settings?.is_ai_enabled;
  const isDraftingEnabled = settings?.is_ai_drafting_enabled && settings?.is_ai_enabled;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setError('Hanya file gambar (JPG/PNG) atau PDF yang didukung.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const extractData = async () => {
    if (!file || !previewUrl) return;

    setIsExtracting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const base64Data = previewUrl.split(',')[1];
      const mimeType = file.type;

      const prompt = `
        Kamu adalah Notaris Senior yang sangat teliti. 
        Tugasmu adalah mengekstrak data dari dokumen legal yang diberikan (KTP atau Sertifikat Tanah).
        
        Jika dokumen adalah KTP, ekstrak: NIK, Nama, Alamat.
        Jika dokumen adalah Sertifikat Tanah, ekstrak: No. Hak (Milik/HGB), Luas (m2), Pemilik.
        
        Aturan:
        1. Output WAJIB JSON Murni tanpa markdown.
        2. Jika gambar buram atau data tidak terbaca dengan jelas, set "needs_manual_review": true.
        3. Jika jenis dokumen tidak dikenali, set type: "UNKNOWN".
        
        Format JSON:
        {
          "type": "KTP" | "SERTIFIKAT" | "UNKNOWN",
          "data": {
            "nik": "string",
            "nama": "string",
            "alamat": "string",
            "no_hak": "string",
            "luas": "string",
            "pemilik": "string"
          },
          "needs_manual_review": boolean
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["KTP", "SERTIFIKAT", "UNKNOWN"] },
              data: {
                type: Type.OBJECT,
                properties: {
                  nik: { type: Type.STRING },
                  nama: { type: Type.STRING },
                  alamat: { type: Type.STRING },
                  no_hak: { type: Type.STRING },
                  luas: { type: Type.STRING },
                  pemilik: { type: Type.STRING }
                }
              },
              needs_manual_review: { type: Type.BOOLEAN }
            },
            required: ["type", "data", "needs_manual_review"]
          }
        }
      });

      const extractedData = JSON.parse(response.text || '{}');
      setResult(extractedData);
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Gagal mengekstrak data. Silakan coba lagi atau gunakan gambar yang lebih jelas.');
    } finally {
      setIsExtracting(false);
    }
  };

  if (featuresLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isOcrEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center ring-1 ring-gold/20">
          <ShieldAlert className="h-10 w-10 text-gold" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Fitur Terkunci</h2>
          <p className="text-sm font-medium text-slate">
            Upgrade ke <span className="text-gold font-bold">Paket Pro</span> untuk menggunakan fitur Ekstraksi Dokumen Legal berbasis AI.
          </p>
        </div>
        <button className="px-8 py-4 bg-navy text-white rounded-2xl text-xs font-black uppercase tracking-widest gold-glow hover:scale-105 transition-all">
          Lihat Paket Berlangganan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-navy uppercase">
            AI <span className="text-gold">Document Extraction</span>
          </h1>
          <p className="text-sm font-medium text-slate">
            Ekstrak data KTP & Sertifikat secara otomatis dengan akurasi tinggi.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20">
          <ScanLine className="h-6 w-6" />
        </div>
      </div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-12 border-2 border-dashed border-gold/20 flex flex-col items-center justify-center space-y-6 text-center transition-all hover:border-gold/40"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="relative group">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 rounded-2xl shadow-2xl ring-1 ring-gold/20"
              />
              <button 
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                className="absolute -top-3 -right-3 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="h-24 w-24 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-300">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-black text-navy uppercase tracking-tight">
              {file ? file.name : 'Unggah Dokumen'}
            </h3>
            <p className="text-xs font-medium text-slate max-w-xs mx-auto">
              Tarik & lepas file di sini atau klik tombol di bawah untuk memilih file (JPG, PNG, PDF).
            </p>
          </div>

          <div className="flex gap-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white border border-zinc-200 text-navy rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-gold transition-all"
            >
              Pilih File
            </button>
            {file && (
              <button 
                onClick={extractData}
                disabled={isExtracting}
                className="px-8 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest gold-glow flex items-center gap-2 disabled:opacity-50"
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                ) : (
                  <Zap className="h-4 w-4 text-gold fill-gold" />
                )}
                {isExtracting ? 'Mengekstrak...' : 'Mulai Ekstraksi'}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-full">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)]">
          {/* Left: Preview */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl overflow-hidden flex flex-col ring-1 ring-gold/10"
          >
            <div className="h-12 bg-navy flex items-center px-6 justify-between">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Document Preview</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-green-500 uppercase">Original View</span>
              </div>
            </div>
            <div className="flex-1 bg-zinc-900 flex items-center justify-center p-8">
              <img 
                src={previewUrl!} 
                alt="Original" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
            </div>
          </motion.div>

          {/* Right: Editable Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl flex flex-col ring-1 ring-gold/10"
          >
            <div className="h-12 bg-white border-b border-zinc-100 flex items-center px-6 justify-between">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-black text-navy uppercase tracking-widest">Extraction Results</span>
              </div>
              {result.needs_manual_review && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-[9px] font-black uppercase ring-1 ring-amber-200">
                  <AlertCircle className="h-3 w-3" />
                  Review Needed
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Document Type</label>
                  <div className="px-4 py-2 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100">
                    {result.type}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Status</label>
                  <div className="px-4 py-2 bg-green-50 rounded-xl text-sm font-bold text-green-600 border border-green-100 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Success
                  </div>
                </div>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="space-y-4">
                {result.type === 'KTP' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate uppercase tracking-widest">NIK</label>
                      <input 
                        type="text" 
                        defaultValue={result.data.nik}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100 focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate uppercase tracking-widest">Nama Lengkap</label>
                      <input 
                        type="text" 
                        defaultValue={result.data.nama}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100 focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate uppercase tracking-widest">Alamat</label>
                      <textarea 
                        defaultValue={result.data.alamat}
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100 focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                      />
                    </div>
                  </>
                )}

                {result.type === 'SERTIFIKAT' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate uppercase tracking-widest">Nomor Hak</label>
                      <input 
                        type="text" 
                        defaultValue={result.data.no_hak}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100 focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate uppercase tracking-widest">Luas Tanah (m2)</label>
                      <input 
                        type="text" 
                        defaultValue={result.data.luas}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100 focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate uppercase tracking-widest">Nama Pemilik</label>
                      <input 
                        type="text" 
                        defaultValue={result.data.pemilik}
                        className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-bold text-navy border border-zinc-100 focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                      />
                    </div>
                  </>
                )}

                {result.type === 'UNKNOWN' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <AlertCircle className="h-12 w-12 text-amber-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-black text-navy uppercase tracking-tight">Dokumen Tidak Dikenali</p>
                      <p className="text-[10px] font-medium text-slate">AI tidak dapat menentukan jenis dokumen ini secara otomatis.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => { setResult(null); setFile(null); setPreviewUrl(null); }}
                  className="flex-1 px-6 py-4 bg-white border border-zinc-200 text-navy rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-gold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Ulangi
                </button>
                <button 
                  className="flex-1 px-6 py-4 bg-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest gold-glow flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <Save className="h-4 w-4 text-gold" />
                  Simpan
                </button>
              </div>
              
              {isDraftingEnabled && (
                <button 
                  onClick={() => setShowDrafting(true)}
                  className="w-full px-6 py-4 bg-gold text-navy rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <FileSignature className="h-4 w-4" />
                  Generate Draft Komparisi
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showDrafting && result && (
          <LegalDraftingTool 
            ocrData={result} 
            profile={profile} 
            onClose={() => setShowDrafting(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
