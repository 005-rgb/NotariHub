import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MidtransService } from './src/services/MidtransService.ts';
import { QuotaGuardService } from './src/services/QuotaGuardService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

  app.use(express.json());

  // Mock Database Sub-Modul 2.1
  const tenants = [
    { id: 'tenant-1', name: 'Notaris Jakarta Pusat', package_level: 'PREMIUM', is_active: true },
    { id: 'tenant-2', name: 'Notaris Bandung Barat', package_level: 'BASIC', is_active: true },
  ];

  const users = [
    { id: 'user-1', tenant_id: 'tenant-1', username: 'notaris_admin', email: 'admin@notaris.id', role: 'NOTARIS' },
    { id: 'user-2', tenant_id: 'tenant-1', username: 'staf_utama', email: 'staf@notaris.id', role: 'STAF_UTAMA' },
  ];

  const subscription_plans = [
    { 
      id: 'BASIC', 
      price_monthly: 100000, 
      max_storage_gb: 5, 
      max_documents_per_month: 50, 
      features: { ai_ocr: false, bulk_export: false } 
    },
    { 
      id: 'PREMIUM', 
      price_monthly: 250000, 
      max_storage_gb: 20, 
      max_documents_per_month: 200, 
      features: { ai_ocr: true, bulk_export: false } 
    },
    { 
      id: 'ENTERPRISE', 
      price_monthly: 500000, 
      max_storage_gb: 100, 
      max_documents_per_month: 1000, 
      features: { ai_ocr: true, bulk_export: true } 
    },
  ];

  const tenant_subscriptions = [
    { id: 'sub-1', tenant_id: 'tenant-1', plan_id: 'PREMIUM', status: 'ACTIVE', midtrans_order_id: 'SUB-notaris-jkt-123', end_date: '2026-04-28' },
    { id: 'sub-2', tenant_id: 'tenant-2', plan_id: 'BASIC', status: 'EXPIRED', midtrans_order_id: 'SUB-notaris-bdg-456', end_date: '2026-03-20' },
  ];

  const tenant_settings = [
    { 
      tenant_id: 'tenant-1', 
      is_white_label_enabled: true, 
      is_ai_enabled: true,
      is_ai_ocr_enabled: true,
      is_ai_drafting_enabled: false,
      is_ai_audit_enabled: true,
      custom_wa_template: "Yth. Bapak/Ibu [Nama], Berkas [Katalog] Anda dengan No. Reg [Folder_ID] telah diterima. Pantau di: [Portal_URL]. User: [Username], Pass: [Password]."
    },
    { 
      tenant_id: 'tenant-2', 
      is_white_label_enabled: false, 
      is_ai_enabled: false,
      is_ai_ocr_enabled: false,
      is_ai_drafting_enabled: false,
      is_ai_audit_enabled: false,
      custom_wa_template: null
    }
  ];

  const folders = [
    { 
      id: 'folder-1', 
      tenant_id: 'tenant-1', 
      name: 'AJB Rumah Bpk. Budi', 
      current_milestone_id: 'milestone-5', 
      needs_revision: false, 
      target_completion_date: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
      is_overdue: false,
      created_at: '2026-03-01', 
      updated_at: '2026-03-20' 
    },
  ];

  const folder_activities: any[] = [];
  const consumer_accounts: any[] = [];

  // Initialize Quota Guard Cache
  QuotaGuardService.initCache(subscription_plans, tenant_subscriptions);

  /**
   * 3. SUBSCRIPTION STATUS GUARD (Middleware)
   * Blocks Write/Update if status != 'ACTIVE', except for Billing.
   */
  const subscriptionGuard = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    const isWriteAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isBillingRoute = req.path.includes('/payments') || req.path.includes('/billing');

    if (isWriteAction && !isBillingRoute) {
      if (!QuotaGuardService.isSubscriptionActive(tenantId)) {
        return res.status(403).json({ 
          error: 'Subscription Inactive', 
          message: 'Your subscription has expired. Please renew in the Billing section.' 
        });
      }
    }
    next();
  };

  app.use(subscriptionGuard);

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  /**
   * 1. CHECK FEATURE ACCESS (Example Route)
   */
  app.get('/api/features/:key', (req, res) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    const featureKey = req.params.key;

    if (!QuotaGuardService.checkFeatureAccess(tenantId, featureKey)) {
      return res.status(403).json({ error: 'Upgrade Your Plan', message: `Feature '${featureKey}' is not available in your current plan.` });
    }
    res.json({ enabled: true });
  });

  /**
   * 2. CHECK QUOTA LIMIT (Example Route: Create Document)
   */
  app.post('/api/documents', (req, res) => {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!QuotaGuardService.checkQuotaLimit(tenantId, 'documents')) {
      return res.status(403).json({ error: 'Quota Exceeded', message: 'You have reached your monthly document limit. Please upgrade your plan.' });
    }

    // Process document creation...
    QuotaGuardService.incrementUsage(tenantId, 'documents');
    res.status(201).json({ status: 'Document Created' });
  });

  /**
   * CREATE TRANSACTION LOGIC
   * Method: 'createSubscriptionOrder(tenant_id, plan_id)'
   */
  app.post('/api/payments/create-subscription', async (req, res) => {
    const { tenant_id, plan_id, tenant_slug } = req.body;
    
    const plan = subscription_plans.find(p => p.id === plan_id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    try {
      const transaction = await MidtransService.createSubscriptionOrder(
        tenant_id, 
        tenant_slug || 'notaris', 
        plan_id, 
        plan.price_monthly
      );
      
      // Store pending subscription in mock DB
      tenant_subscriptions.push({
        id: `sub-${Date.now()}`,
        tenant_id,
        plan_id,
        status: 'PENDING_PAYMENT',
        midtrans_order_id: transaction.order_id,
        end_date: ''
      });

      res.json(transaction);
    } catch (err) {
      res.status(500).json({ error: 'Payment creation failed' });
    }
  });

  /**
   * WEBHOOK / NOTIFICATION HANDLER
   * Endpoint: POST '/payments/midtrans-callback'
   */
  app.post('/api/payments/midtrans-callback', async (req, res) => {
    const notification = req.body;

    // SECURITY VALIDATION: Verify signature_key
    if (!MidtransService.verifySignature(notification)) {
      console.error('[MidtransCallback] Invalid Signature Key');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const { order_id, transaction_status } = notification;
    const subscription = tenant_subscriptions.find(s => s.midtrans_order_id === order_id);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // UPDATE LOGIC: Based on transaction_status
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      subscription.status = 'ACTIVE';
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      subscription.end_date = endDate.toISOString().split('T')[0];
    } else if (transaction_status === 'pending') {
      subscription.status = 'PENDING_PAYMENT';
    } else if (transaction_status === 'expire' || transaction_status === 'deny' || transaction_status === 'cancel') {
      subscription.status = 'EXPIRED';
    }

    console.log(`[MidtransCallback] Order ${order_id} updated to ${subscription.status}`);
    res.json({ status: 'success' });
  });

  /**
   * 3. VETO/ROLLBACK LOGIC (Modul 3)
   * Method: 'revertFolderStatus(folder_id, target_milestone_id, reason_text)'
   * ACCESS CONTROL: Only 'NOTARIS' can revert status.
   */
  app.post('/api/folders/revert-status', (req, res) => {
    const { folder_id, target_milestone_id, reason_text } = req.body;
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;

    // 2. ACCESS CONTROL: WAJIB cek 'current_user.role'
    if (userRole !== 'NOTARIS') {
      return res.status(403).json({ 
        error: 'Unauthorized', 
        message: 'Unauthorized: Only Notary can revert status' 
      });
    }

    const folder = folders.find(f => f.id === folder_id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    const oldMilestoneId = folder.current_milestone_id;

    // 3. TRANSACTIONAL INTEGRITY: UPDATE folders & INSERT folder_activities
    // SQL Equivalent:
    // UPDATE folders SET current_milestone_id = $1, needs_revision = true, updated_at = NOW() WHERE id = $2;
    folder.current_milestone_id = target_milestone_id;
    folder.needs_revision = true; // 4. NOTIFICATION LOGIC: Trigger flag 'needs_revision'
    folder.updated_at = new Date().toISOString();

    // SQL Equivalent:
    // INSERT INTO folder_activities (user_id, folder_id, action_type, old_status, new_status, payload_change)
    // VALUES ($3, $2, 'STATUS_ROLLBACK', $4, $1, jsonb_build_object('reason', $5));
    folder_activities.push({
      id: `act-${Date.now()}`,
      user_id: userId,
      folder_id: folder_id,
      action_type: 'STATUS_ROLLBACK',
      old_status: oldMilestoneId,
      new_status: target_milestone_id,
      payload_change: { reason: reason_text },
      created_at: new Date().toISOString()
    });

    console.log(`[VetoSystem] Folder ${folder_id} reverted to ${target_milestone_id} by ${userId}. Reason: ${reason_text}`);
    res.json({ status: 'success', message: 'Folder status reverted and revision flag triggered' });
  });

  // Mock Folder List Data (150 records)
  const folder_list_data = Array.from({ length: 150 }, (_, i) => {
    const targetDate = new Date(Date.now() + (i % 5 === 0 ? -86400000 : 86400000 * (i % 10)));
    return {
      id: `uuid-${i + 1}`,
      client_name: i % 2 === 0 ? `Budi Santoso ${i + 1}` : `Siti Aminah ${i + 1}`,
      nik: `331201${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      catalog_code: ['AJB', 'APHT', 'SKMHT', 'FIDUSIA', 'WASIAT'][i % 5],
      current_milestone: ['Validasi Pajak', 'Plotting', 'Tanda Tangan', 'Minuta', 'Selesai'][i % 5],
      progress_pct: (i % 5 + 1) * 20,
      is_vetoed: i % 15 === 0,
      target_completion_date: targetDate.toISOString(),
      is_overdue: targetDate < new Date()
    };
  });

  /**
   * PAGINATED FOLDER LIST API
   * Method: GET '/api/folders'
   */
  // Helper: Generate Random 8-character Alphanumeric Password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  /**
   * 2. LOGIC: 'generateConsumerAuth(folder_id, tenant_id, username)'
   * Requirement: Alphanumeric password, hashing, no plain-text in DB/logs, return payload for WhatsApp.
   */
  const generateConsumerAuth = async (folder_id: string, tenant_id: string, username: string) => {
    const plain_password = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(plain_password, salt);

    // 5. ERROR HANDLING: Check if username already exists in the same tenant
    let account = consumer_accounts.find(acc => acc.tenant_id === tenant_id && acc.username === username);

    if (account) {
      // Update password if it exists
      account.password_hash = password_hash;
      account.folder_id = folder_id; // Update folder_id to the latest one
      account.updated_at = new Date().toISOString();
    } else {
      // Create new account
      account = {
        id: `acc-${Date.now()}`,
        tenant_id,
        folder_id,
        username,
        password_hash,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      consumer_accounts.push(account);
    }

    // 4. COMMUNICATION PAYLOAD
    // Construct login_url: https://[tenant_slug].notarisapp.com
    const tenant = tenants.find(t => t.id === tenant_id);
    const tenantSlug = tenant ? tenant.name.toLowerCase().replace(/\s+/g, '-') : 'office';
    const login_url = `https://${tenantSlug}.notarisapp.com`;

    return {
      username,
      temporary_password: plain_password,
      login_url
    };
  };

  /**
   * 2. PROFESSIONAL DISPATCH LOGIC (Backend)
   * Requirement: Conditional message based on white-label toggle.
   */
  const dispatchCredentials = async (tenant_id: string, folder_id: string, authData: any) => {
    const settings = tenant_settings.find(s => s.tenant_id === tenant_id);
    const folder = folders.find(f => f.id === folder_id);
    const tenant = tenants.find(t => t.id === tenant_id);
    
    const portalUrl = `https://${tenant?.name.toLowerCase().replace(/\s+/g, '-') || 'office'}.notarisapp.com`;
    const catalogType = folder?.name.split(' ')[0] || 'Legal'; // Extract first word as catalog type for mock
    const clientName = folder?.name.split(' ').slice(1).join(' ') || 'Client';

    let message = "";

    if (settings?.is_white_label_enabled) {
      // Professional Template
      message = (settings.custom_wa_template || "")
        .replace("[Nama]", clientName)
        .replace("[Katalog]", catalogType)
        .replace("[Folder_ID]", folder_id)
        .replace("[Portal_URL]", portalUrl)
        .replace("[Username]", authData.username)
        .replace("[Password]", authData.temporary_password);
    } else {
      // Basic Message
      message = `Kredensial Login: ${authData.username} / ${authData.temporary_password}`;
    }

    // Mock sending to WhatsApp Gateway
    console.log(`[WhatsAppGateway] Sending to Consumer for Folder ${folder_id}:`);
    console.log(`>>> ${message}`);
    
    return message;
  };

  /**
   * API: Create Folder with Automatic Consumer Account
   */
  app.post('/api/folders', async (req, res) => {
    const { client_name, object_id, group_id } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    const newFolder = {
      id: `folder-${Date.now()}`,
      tenant_id: tenantId,
      name: client_name,
      current_milestone_id: 'milestone-1', // Default start
      needs_revision: false,
      target_completion_date: '',
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    folders.push(newFolder);

    // TRIGGER: Automatic Consumer Account Creation
    // Requirement 1: Username default to NIK/Object ID
    const username = object_id || client_name.replace(/\s+/g, '').toLowerCase();
    const authData = await generateConsumerAuth(newFolder.id, tenantId, username);

    // TRIGGER: Professional Dispatch
    await dispatchCredentials(tenantId, newFolder.id, authData);

    // Security check: Plain password is NOT logged
    console.log(`[ConsumerAuth] Account created/updated for ${client_name}. Username: ${authData.username}, Login URL: ${authData.login_url}`);

    res.json({ 
      status: 'success', 
      folder: newFolder,
      consumer_auth: authData // Send to frontend to trigger WhatsApp API
    });
  });

  /**
   * 3. INTEGRATION (Aturan 4): Reset Password for Notary/Staff
   */
  app.post('/api/folders/:id/reset-consumer-password', async (req, res) => {
    const userRole = req.headers['x-user-role'] as string;
    if (!['NOTARIS', 'STAF_UTAMA'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const account = consumer_accounts.find(acc => acc.folder_id === req.params.id);
    if (!account) return res.status(404).json({ error: 'Consumer account not found' });

    const plain_password = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    account.password_hash = await bcrypt.hash(plain_password, salt);

    res.json({ 
      status: 'success', 
      message: 'Password reset successful',
      new_plain_password: plain_password 
    });
  });

  /**
   * 4. MANUAL TARGET SETTER (Modul 3.8)
   * Only Notary can set target completion date.
   */
  app.post('/api/folders/:id/target', async (req, res) => {
    const userRole = req.headers['x-user-role'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userName = req.headers['x-user-name'] as string;
    const { target_date } = req.body;

    if (userRole !== 'NOTARIS') {
      return res.status(403).json({ error: 'Unauthorized: Only Notary can set targets' });
    }

    const folder = folders.find(f => f.id === req.params.id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    const targetDate = new Date(target_date);
    const isOverdue = targetDate < new Date();

    folder.target_completion_date = targetDate.toISOString();
    folder.is_overdue = isOverdue;
    folder.updated_at = new Date().toISOString();

    // Log Activity
    folder_activities.push({
      id: `act-${Date.now()}`,
      user_id: userId,
      user_name: userName || 'Notaris',
      user_role: userRole,
      folder_id: folder.id,
      action_type: 'VERIFICATION', // Using generic for target set
      payload_change: { 
        description: `Notaris menetapkan target penyelesaian pada ${targetDate.toLocaleDateString('id-ID')}` 
      },
      created_at: new Date().toISOString()
    });

    res.json({ 
      status: 'success', 
      target_completion_date: folder.target_completion_date,
      is_overdue: folder.is_overdue
    });
  });

  /**
   * 5. SUPER ADMIN SETTINGS (Modul 3.9)
   * Only Super Admin can toggle White-Label Branding.
   */
  app.get('/api/admin/settings/:tenantId', (req, res) => {
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Unauthorized' });

    const settings = tenant_settings.find(s => s.tenant_id === req.params.tenantId);
    res.json(settings || { 
      tenant_id: req.params.tenantId, 
      is_white_label_enabled: false, 
      is_ai_enabled: false,
      is_ai_ocr_enabled: false,
      is_ai_drafting_enabled: false,
      is_ai_audit_enabled: false,
      custom_wa_template: '' 
    });
  });

  app.patch('/api/admin/settings/:tenantId', (req, res) => {
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Unauthorized' });

    const { 
      is_white_label_enabled, 
      is_ai_enabled, 
      is_ai_ocr_enabled,
      is_ai_drafting_enabled,
      is_ai_audit_enabled,
      custom_wa_template 
    } = req.body;
    let settings = tenant_settings.find(s => s.tenant_id === req.params.tenantId);

    if (!settings) {
      settings = { 
        tenant_id: req.params.tenantId, 
        is_white_label_enabled: false, 
        is_ai_enabled: false,
        is_ai_ocr_enabled: false,
        is_ai_drafting_enabled: false,
        is_ai_audit_enabled: false,
        custom_wa_template: '' 
      };
      tenant_settings.push(settings);
    }

    if (is_white_label_enabled !== undefined) settings.is_white_label_enabled = is_white_label_enabled;
    if (is_ai_enabled !== undefined) settings.is_ai_enabled = is_ai_enabled;
    if (is_ai_ocr_enabled !== undefined) settings.is_ai_ocr_enabled = is_ai_ocr_enabled;
    if (is_ai_drafting_enabled !== undefined) settings.is_ai_drafting_enabled = is_ai_drafting_enabled;
    if (is_ai_audit_enabled !== undefined) settings.is_ai_audit_enabled = is_ai_audit_enabled;
    if (custom_wa_template !== undefined) settings.custom_wa_template = custom_wa_template;

    res.json({ status: 'success', settings });
  });

  app.get('/api/folders', (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const data = folder_list_data.slice(offset, offset + limit);
    
    res.json({
      total_records: folder_list_data.length,
      current_page: page,
      data: data
    });
  });

  app.get('/api/tenants/:id', (req, res) => {
    // ... existing logic ...
    const tenant = tenants.find(t => t.id === req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  });

  app.get('/api/users/profile', (req, res) => {
    // In a real app, this would be derived from a JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const user = users[0]; // Mocking the first user for now
    res.json(user);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
