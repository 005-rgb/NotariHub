import { UserRole } from '../types';

/**
 * QUOTA GUARD SERVICE: Subscription & Feature Logic
 * Based on Sub-Modul 2.1
 */
export class QuotaGuardService {
  // In-Memory Cache for Plan & Subscription Data
  private static planCache = new Map<string, any>();
  private static subscriptionCache = new Map<string, any>();
  private static usageCache = new Map<string, number>();

  /**
   * INITIALIZE CACHE (Mocking DB Fetch)
   */
  public static initCache(plans: any[], subscriptions: any[]) {
    plans.forEach(p => this.planCache.set(p.id, p));
    subscriptions.forEach(s => this.subscriptionCache.set(s.tenant_id, s));
  }

  /**
   * 1. CHECK FEATURE ACCESS
   * Validates if a specific feature (e.g., 'ai_ocr') is enabled in the plan.
   */
  public static checkFeatureAccess(tenantId: string, featureKey: string): boolean {
    const sub = this.subscriptionCache.get(tenantId);
    if (!sub) return false;

    const plan = this.planCache.get(sub.plan_id || 'BASIC');
    return !!plan?.features?.[featureKey];
  }

  /**
   * 2. CHECK QUOTA LIMIT
   * Compares current usage vs max_documents_per_month.
   */
  public static checkQuotaLimit(tenantId: string, resourceType: string): boolean {
    const sub = this.subscriptionCache.get(tenantId);
    if (!sub) return false;

    const plan = this.planCache.get(sub.plan_id || 'BASIC');
    const currentUsage = this.usageCache.get(`${tenantId}_${resourceType}`) || 0;

    if (resourceType === 'documents') {
      return currentUsage < (plan?.max_documents_per_month || 0);
    }
    return true;
  }

  /**
   * 3. SUBSCRIPTION STATUS GUARD
   * Blocks Write/Update if status != 'ACTIVE'.
   */
  public static isSubscriptionActive(tenantId: string): boolean {
    const sub = this.subscriptionCache.get(tenantId);
    return sub?.status === 'ACTIVE';
  }

  /**
   * INCREMENT USAGE (Helper)
   */
  public static incrementUsage(tenantId: string, resourceType: string) {
    const key = `${tenantId}_${resourceType}`;
    this.usageCache.set(key, (this.usageCache.get(key) || 0) + 1);
  }
}
