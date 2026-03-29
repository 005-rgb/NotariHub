import midtransClient from 'midtrans-client';
import crypto from 'crypto';

/**
 * MIDTRANS SERVICE: Subscription Payment Logic
 * Based on Sub-Modul 2.1
 */
export class MidtransService {
  private static snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder',
  });

  /**
   * CREATE SUBSCRIPTION ORDER
   * Generates snap_token and redirect_url for frontend
   */
  public static async createSubscriptionOrder(tenantId: string, tenantSlug: string, planId: string, price: number) {
    const orderId = `SUB-${tenantSlug}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        tenant_id: tenantId,
      },
      item_details: [{
        id: planId,
        price: price,
        quantity: 1,
        name: `Subscription Plan: ${planId}`,
      }],
      callbacks: {
        finish: `${process.env.APP_URL}/payment-finish`,
      }
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return {
        snap_token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId,
      };
    } catch (error) {
      console.error('[MidtransService] Transaction Creation Failed:', error);
      throw error;
    }
  }

  /**
   * VERIFY SIGNATURE KEY
   * Prevents fake callbacks from hackers
   */
  public static verifySignature(notification: any): boolean {
    const { order_id, status_code, gross_amount, signature_key } = notification;
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';
    
    const payload = order_id + status_code + gross_amount + serverKey;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');
    
    return hash === signature_key;
  }
}
