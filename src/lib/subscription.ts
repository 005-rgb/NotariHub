import { NotaryHttpClient } from './NotaryHttpClient';

/**
 * FRONTEND SYNC: Subscription Helper
 * Used in UI to hide/show buttons or features.
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  try {
    const res = await NotaryHttpClient.get(`/api/features/${featureKey}`);
    if (res.ok) {
      const data = await res.json();
      return !!data.enabled;
    }
    return false;
  } catch (err) {
    console.error(`[SubscriptionHelper] Failed to check feature '${featureKey}':`, err);
    return false;
  }
}

/**
 * Check if subscription is active (Client-side check)
 */
export function isSubscriptionActive(profile: any): boolean {
  // This is a basic client-side check. 
  // The server-side middleware (Subscription Status Guard) is the source of truth.
  return profile?.subscription_status === 'ACTIVE';
}
