import React, { useState, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  FileText, 
  Zap, 
  Loader2, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  FileSignature,
  Scale,
  ShieldCheck as ShieldCheckIcon,
  AlertTriangle,
  SearchCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useFeatures } from '../context/FeatureContext';
import { cn } from '../lib/utils';
import { OcrResult, UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditWarning {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  suggestion?: string;
}

interface LegalDraftingToolProps {
  ocrData: OcrResult;
  profile: UserProfile | null;
  onClose: () => void;
}

export const LegalDraftingTool: React.FC<LegalDraftingToolProps> = ({ ocrData, profile, onClose }) => {
  const { settings } = useFeatures();
  const [draft, setDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditWarning[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDraftingEnabled = settings?.is_ai_drafting_enabled && settings?.is_ai_enabled;
  const isAuditEnabled = settings?.is_ai_audit_enabled && settings?.is_ai_enabled;

  const generateKomparisi = async () => {
    if (!isDraftingEnabled) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateString = today.toLocaleDateString('id-ID', options);
      
      const prompt = `
        Kamu adalah Notaris Senior yang ahli dalam UU Jabatan Notaris (UUJN) Indonesia.
        Tugasmu adalah menyusun bagian "Komparisi" dari sebuah Akta Notaris berdasarkan data identitas yang diberikan.

        Data Input:
        - Jenis Dokumen: ${ocrData.type}
        - Data Identitas: ${JSON.stringify(ocrData.data)}
        - Nama Notaris: ${profile?.username || '[Nama Notaris]'}
        - Kedudukan Notaris: ${settings?.tenant_id === 'tenant-1' ? 'Jakarta Pusat' : 'Bandung'}
        - Tanggal Hari Ini: ${dateString}

        Aturan Penulisan (UUJN):
        1. Gunakan bahasa hukum Indonesia yang baku, formal, dan sangat teliti.
        2. Format pembukaan: "Pada hari ini, ${dateString}..."
        3. Bagian Komparisi: "Menghadap kepada saya, ${profile?.username || '[Nama Notaris]'}, Sarjana Hukum, Magister Kenotariatan, Notaris di [Kedudukan], dengan dihadiri oleh saksi-saksi yang saya, Notaris kenal dan akan disebutkan pada bagian akhir akta ini:"
        4. Deskripsi Penghadap: Sebutkan Nama, NIK, dan Alamat sesuai data. Jika data tidak lengkap, gunakan placeholder [TIDAK TERBACA].
        5. Sertakan klausul identitas: "Penghadap dikenal oleh saya, Notaris, berdasarkan identitas yang diperlihatkan kepada saya."
        6. Jika dokumen adalah Sertifikat, sesuaikan narasi bahwa penghadap bertindak sebagai pemilik hak atas tanah tersebut.

        Output: Teks lengkap bagian Komparisi saja dalam format HTML sederhana (gunakan <p> dan <b> untuk penekanan).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      setDraft(response.text || '');
    } catch (err) {
      console.error('Drafting Error:', err);
      setError('Gagal menyusun draf. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const runAudit = async () => {
    if (!isAuditEnabled || !draft) return;
    
    setIsAuditing(true);
    setError(null);
    setAuditResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Kamu adalah Legal Compliance Auditor spesialis UU Jabatan Notaris (UUJN).
        Tugasmu adalah melakukan audit terhadap draf akta (Komparisi) yang dibuat oleh staf.
        
        Data Referensi (OCR KTP/Sertifikat):
        ${JSON.stringify(ocrData.data)}
        
        Draf Akta yang di-audit:
        ${draft.replace(/<[^>]*>/g, '')}
        
        Kriteria Audit:
        1. Validasi NIK: Harus tepat 16 digit. Jika kurang/lebih, berikan peringatan CRITICAL.
        2. Validasi Nama: Bandingkan nama di draf dengan nama di data referensi. Jika ada typo atau perbedaan, berikan peringatan CRITICAL.
        3. Validasi UUJN: Pastikan format pembukaan dan penyebutan Notaris sesuai standar hukum.
        4. Validasi Hari: Jika draf menyebutkan hari libur (Sabtu/Minggu), berikan peringatan INFO.
        
        Output WAJIB JSON Array of Objects:
        [{ "type": "CRITICAL" | "WARNING" | "INFO", "message": "string", "suggestion": "string" }]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["CRITICAL", "WARNING", "INFO"] },
                message: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["type", "message"]
            }
          }
        }
      });

      const results = JSON.parse(response.text || '[]');
      setAuditResults(results);
    } catch (err) {
      console.error('Audit Error:', err);
      setError('Gagal menjalankan audit hukum.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopy = () => {
    // Strip HTML for plain text copy if needed, but Quill handles rich text copy well
    const textArea = document.createElement('textarea');
    textArea.value = draft.replace(/<[^>]*>/g, '');
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md"
    >
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-gold/20">
        {/* Header */}
        <div className="h-20 bg-navy flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center ring-1 ring-gold/30">
              <FileSignature className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">AI Legal <span className="text-gold">Drafter</span></h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penyusunan Komparisi Otomatis (UUJN)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Context & Trigger */}
          <div className="w-80 border-r border-zinc-100 p-8 flex flex-col gap-8 bg-zinc-50/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-navy">
                <Scale className="h-4 w-4 text-gold" />
                <span className="text-xs font-black uppercase tracking-widest">Context Mapping</span>
              </div>
              <div className="space-y-2">
                <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate uppercase tracking-widest mb-1">Jenis Dokumen</p>
                  <p className="text-xs font-bold text-navy">{ocrData.type}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate uppercase tracking-widest mb-1">Nama Penghadap</p>
                  <p className="text-xs font-bold text-navy truncate">{ocrData.data.nama || ocrData.data.pemilik || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-200" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-navy">
                <Zap className="h-4 w-4 text-gold" />
                <span className="text-xs font-black uppercase tracking-widest">AI Action</span>
              </div>
              
              {!isDraftingEnabled ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Feature Locked</span>
                  </div>
                  <p className="text-[9px] font-medium text-amber-700 leading-relaxed">
                    Fitur AI Drafting belum aktif. Silakan hubungi Super Admin untuk mengaktifkan modul ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={generateKomparisi}
                    disabled={isGenerating}
                    className="w-full py-4 bg-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest gold-glow flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    ) : (
                      <Zap className="h-4 w-4 text-gold fill-gold" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Komparisi'}
                  </button>

                  {draft && isAuditEnabled && (
                    <button 
                      onClick={runAudit}
                      disabled={isAuditing}
                      className="w-full py-4 bg-white border border-navy text-navy rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-navy hover:text-white transition-all disabled:opacity-50"
                    >
                      {isAuditing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gold" />
                      ) : (
                        <SearchCheck className="h-4 w-4 text-gold" />
                      )}
                      {isAuditing ? 'Auditing...' : 'Audit Compliance'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Right: Rich Text Editor */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="h-12 border-b border-zinc-100 flex items-center px-8 justify-between bg-zinc-50/30">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-black text-navy uppercase tracking-widest">Draft Editor</span>
              </div>
              {draft && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-[9px] font-black text-navy uppercase tracking-widest hover:border-gold transition-all"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gold" />}
                  {copied ? 'Copied!' : 'Copy to Word'}
                </button>
              )}
            </div>

            <div className="flex-1 p-8 overflow-hidden">
              <div className="h-full border border-zinc-200 rounded-2xl overflow-hidden shadow-inner bg-zinc-50/20">
                <ReactQuill 
                  theme="snow" 
                  value={draft} 
                  onChange={setDraft}
                  placeholder="Klik 'Generate Komparisi' untuk menyusun draf otomatis..."
                  className="h-full legal-editor"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Audit Report Sidebar */}
          <AnimatePresence>
            {(isAuditing || auditResults) && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-zinc-100 bg-zinc-50/50 flex flex-col overflow-hidden"
              >
                <div className="h-12 border-b border-zinc-100 flex items-center px-6 justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] font-black text-navy uppercase tracking-widest">Audit Report</span>
                  </div>
                  <button onClick={() => setAuditResults(null)} className="text-slate-400 hover:text-navy">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {isAuditing ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gold" />
                      <p className="text-[10px] font-black text-navy uppercase tracking-widest animate-pulse">Analyzing Compliance...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-slate uppercase tracking-widest">Findings: {auditResults?.length || 0}</span>
                        <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        </div>
                      </div>

                      {auditResults?.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-green-50 border border-green-100 text-center space-y-2">
                          <Check className="h-8 w-8 text-green-500 mx-auto" />
                          <p className="text-[10px] font-black text-green-700 uppercase">Draf Sesuai Standar</p>
                          <p className="text-[9px] font-medium text-green-600">Tidak ditemukan kesalahan fatal pada draf ini.</p>
                        </div>
                      ) : (
                        auditResults?.map((warning, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "p-4 rounded-2xl border flex flex-col gap-2 shadow-sm",
                              warning.type === 'CRITICAL' ? "bg-red-50 border-red-100" : 
                              warning.type === 'WARNING' ? "bg-amber-50 border-amber-100" : 
                              "bg-blue-50 border-blue-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {warning.type === 'CRITICAL' ? <AlertCircle className="h-4 w-4 text-red-500" /> :
                               warning.type === 'WARNING' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> :
                               <Info className="h-4 w-4 text-blue-500" />}
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-tight",
                                warning.type === 'CRITICAL' ? "text-red-700" : 
                                warning.type === 'WARNING' ? "text-amber-700" : 
                                "text-blue-700"
                              )}>
                                {warning.type}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-navy leading-relaxed">{warning.message}</p>
                            {warning.suggestion && (
                              <div className="mt-1 p-2 bg-white/50 rounded-lg border border-black/5">
                                <p className="text-[9px] font-medium text-slate italic">Saran: {warning.suggestion}</p>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .legal-editor .ql-container {
          font-family: 'Times New Roman', serif;
          font-size: 14px;
          line-height: 1.8;
          border: none !important;
        }
        .legal-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f4f4f5 !important;
          background: #fafafa;
        }
        .legal-editor .ql-editor {
          padding: 40px;
          min-height: 100%;
        }
        .legal-editor .ql-editor p {
          margin-bottom: 1em;
          text-align: justify;
        }
      `}</style>
    </motion.div>
  );
};
