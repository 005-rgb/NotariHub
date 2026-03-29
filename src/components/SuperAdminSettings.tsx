import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Check, Save, Loader2, Info, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { useFeatures } from '../context/FeatureContext';
import { Tenant } from '../types';

export const SuperAdminSettings: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const { settings, isLoading, toggleFeature, updateSettings, refreshSettings } = useFeatures();
  const [saving, setSaving] = useState(false);

  // Mock tenants for selection
  useEffect(() => {
    setTenants([
      { id: 'tenant-1', name: 'Notaris Jakarta Pusat', package_level: 'PREMIUM', is_active: true, created_at: '' },
      { id: 'tenant-2', name: 'Notaris Bandung Barat', package_level: 'BASIC', is_active: true, created_at: '' },
    ]);
  }, []);

  // When tenant selection changes, we need to ensure the context is aware
  // In a real app, NotaryHttpClient.getContext() would be updated or the provider would take tid as prop
  // For this demo, we'll manually refresh if the selected tenant differs from current session
  useEffect(() => {
    if (selectedTenantId) {
      // Simulate switching tenant context for the API client
      localStorage.setItem('APP_SESSION_ID_tid', selectedTenantId);
      refreshSettings();
    }
  }, [selectedTenantId, refreshSettings]);

  const handleSave = async () => {
    if (!settings || !selectedTenantId) return;
    setSaving(true);
    try {
      // The updateSettings function in context already handles the API call and state sync
      await updateSettings(settings);
      console.log('Settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-navy uppercase">
            System <span className="text-gold">Configuration</span>
          </h1>
          <p className="text-sm font-medium text-slate">
            Super Admin Control Panel • Feature Toggles & White-Labeling
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20">
          <Shield className="h-6 w-6" />
        </div>
      </div>

      {/* Tenant Selector */}
      <div className="glass-card rounded-3xl p-8 ring-1 ring-gold/10">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate mb-4 block">Select Office / Tenant</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTenantId(t.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                selectedTenantId === t.id 
                  ? "bg-navy border-gold text-white shadow-xl scale-[1.02]" 
                  : "bg-white border-zinc-100 text-navy hover:border-gold/30"
              )}
            >
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-tight">{t.name}</p>
                <p className={cn("text-[10px] font-bold uppercase", selectedTenantId === t.id ? "text-gold" : "text-slate")}>
                  Package: {t.package_level}
                </p>
              </div>
              {selectedTenantId === t.id && <Check className="h-4 w-4 text-gold" />}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      {selectedTenantId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 ring-1 ring-gold/10 space-y-8"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : (
            <>
              {/* Feature Toggles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* White Label Toggle */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-navy uppercase tracking-tight">White-Labeling</h3>
                    <p className="text-[10px] font-medium text-slate">Custom WA & Branding</p>
                  </div>
                  
                  <button
                    onClick={() => toggleFeature('is_white_label_enabled')}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
                      settings?.is_white_label_enabled ? "bg-navy" : "bg-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                      settings?.is_white_label_enabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                {/* AI Feature Toggle */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-navy uppercase tracking-tight">AI Assistant</h3>
                      <Zap className="h-3 w-3 text-gold fill-gold" />
                    </div>
                    <p className="text-[10px] font-medium text-slate">Master Switch for AI Features</p>
                  </div>
                  
                  <button
                    onClick={() => toggleFeature('is_ai_enabled')}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
                      settings?.is_ai_enabled ? "bg-navy" : "bg-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                      settings?.is_ai_enabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>

              {/* AI Granular Controls */}
              <div className={cn("space-y-6 transition-all duration-500", settings?.is_ai_enabled ? "opacity-100" : "opacity-40 pointer-events-none")}>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate">AI Granular Controls</span>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* AI OCR */}
                  <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-navy uppercase tracking-tight">AI OCR</h4>
                      <button
                        onClick={() => toggleFeature('is_ai_ocr_enabled')}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300",
                          settings?.is_ai_ocr_enabled ? "bg-gold" : "bg-zinc-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                          settings?.is_ai_ocr_enabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <p className="text-[9px] font-medium text-slate leading-relaxed">
                      Ekstraksi data otomatis dari dokumen fisik (KTP, Sertifikat, dll).
                    </p>
                  </div>

                  {/* AI Drafting */}
                  <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-navy uppercase tracking-tight">AI Drafting</h4>
                      <button
                        onClick={() => toggleFeature('is_ai_drafting_enabled')}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300",
                          settings?.is_ai_drafting_enabled ? "bg-gold" : "bg-zinc-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                          settings?.is_ai_drafting_enabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <p className="text-[9px] font-medium text-slate leading-relaxed">
                      Pembuatan draf akta otomatis berdasarkan template dan data input.
                    </p>
                  </div>

                  {/* AI Audit */}
                  <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-navy uppercase tracking-tight">AI Audit</h4>
                      <button
                        onClick={() => toggleFeature('is_ai_audit_enabled')}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300",
                          settings?.is_ai_audit_enabled ? "bg-gold" : "bg-zinc-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                          settings?.is_ai_audit_enabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <p className="text-[9px] font-medium text-slate leading-relaxed">
                      Pengecekan kepatuhan dan validasi silang data antar dokumen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Editor */}
              <div className={cn("space-y-4 transition-all duration-500", settings?.is_white_label_enabled ? "opacity-100" : "opacity-40 pointer-events-none")}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate">Custom WhatsApp Template</label>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-gold uppercase bg-gold/5 px-2 py-1 rounded-full">
                    <Info className="h-3 w-3" />
                    Variables: [Nama], [Katalog], [Folder_ID], [Portal_URL], [Username], [Password]
                  </div>
                </div>
                <textarea
                  value={settings?.custom_wa_template || ''}
                  onChange={(e) => updateSettings({ custom_wa_template: e.target.value })}
                  className="w-full h-32 rounded-2xl border-zinc-100 bg-zinc-50 p-6 text-sm font-medium text-navy focus:border-gold focus:ring-gold transition-all resize-none shadow-inner"
                  placeholder="Yth. Bapak/Ibu [Nama]..."
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-navy px-8 py-4 text-xs font-black text-white uppercase tracking-widest shadow-2xl transition-all hover:bg-zinc-800 hover:scale-[1.02] gold-glow disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <Save className="h-4 w-4 text-gold" />}
                  Save Configuration
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};
