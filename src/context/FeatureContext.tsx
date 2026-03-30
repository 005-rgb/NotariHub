import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NotaryHttpClient } from '../lib/NotaryHttpClient';
import { TenantSettings } from '../types';

interface FeatureContextType {
  settings: TenantSettings | null;
  isLoading: boolean;
  error: string | null;
  toggleFeature: (featureName: keyof TenantSettings) => Promise<void>;
  updateSettings: (newSettings: Partial<TenantSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantIdRef = useRef(NotaryHttpClient.getContext().tid);
  const tenantId = tenantIdRef.current;

  const fetchSettings = useCallback(async (tid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await NotaryHttpClient.get(`/api/admin/settings/${tid}`);
      if (res.ok) {
        const data: TenantSettings = await res.json();
        
        // PRE-RENDER GUARD: Compare primitive values before setting state
        setSettings((prev) => {
          if (!prev) return data;
          
          const hasChanged = 
            prev.is_white_label_enabled !== data.is_white_label_enabled ||
            prev.is_ai_enabled !== data.is_ai_enabled ||
            prev.is_ai_ocr_enabled !== data.is_ai_ocr_enabled ||
            prev.is_ai_drafting_enabled !== data.is_ai_drafting_enabled ||
            prev.is_ai_audit_enabled !== data.is_ai_audit_enabled ||
            prev.custom_wa_template !== data.custom_wa_template;
            
          return hasChanged ? data : prev;
        });
      } else {
        setError('Failed to load feature settings');
      }
    } catch (err) {
      setError('Network error loading feature settings');
      console.error('[FeatureContext] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // STABILIZED USEEFFECT: Only depends on tenantId
  useEffect(() => {
    if (tenantId) {
      fetchSettings(tenantId);
    } else {
      setIsLoading(false);
    }
  }, [tenantId, fetchSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<TenantSettings>) => {
    if (!tenantId) return;
    
    try {
      const res = await NotaryHttpClient.patch(`/api/admin/settings/${tenantId}`, newSettings);
      if (res.ok) {
        const result = await res.json();
        const updatedData = result.settings;
        
        // Atomic update of local state
        setSettings((prev) => {
          if (!prev) return updatedData;
          return { ...prev, ...updatedData };
        });
      }
    } catch (err) {
      console.error('[FeatureContext] Update error:', err);
      throw err;
    }
  }, [tenantId]);

  const toggleFeature = useCallback(async (featureName: keyof TenantSettings) => {
    if (!settings || typeof settings[featureName] !== 'boolean') return;
    
    const newValue = !settings[featureName];
    await updateSettings({ [featureName]: newValue });
  }, [settings, updateSettings]);

  const refreshSettings = useCallback(async () => {
    if (tenantId) await fetchSettings(tenantId);
  }, [tenantId, fetchSettings]);

  const value = useMemo(() => ({
    settings,
    isLoading,
    error,
    toggleFeature,
    updateSettings,
    refreshSettings
  }), [settings, isLoading, error, toggleFeature, updateSettings, refreshSettings]);

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};
