import React from 'react';
import { useFeatures } from '../context/FeatureContext';
import { Loader2 } from 'lucide-react';

interface FeatureGateProps {
  feature: 'white-label' | 'ai';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * FeatureGate Component
 * 
 * A high-performance wrapper to conditionally render features based on global tenant settings.
 * Uses FeatureContext to avoid individual API calls and infinite re-render loops.
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback = null }) => {
  const { settings, isLoading } = useFeatures();

  // PRE-RENDER GUARD: Prevent rendering children until status is confirmed
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 text-[10px] font-bold text-slate uppercase animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin text-gold" />
        Verifying Feature Access...
      </div>
    );
  }

  const isEnabled = feature === 'white-label' 
    ? !!settings?.is_white_label_enabled 
    : !!settings?.is_ai_enabled;

  return isEnabled ? <>{children}</> : <>{fallback}</>;
};
