export type UserRole = 'NOTARIS' | 'STAF_UTAMA' | 'STAF_LAPANGAN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  tenant_id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  package_level: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  is_active: boolean;
  created_at: string;
}

export interface StaffMember {
  id: string;
  tenant_id: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface JWTPayload {
  uid: string;
  tid: string;
  role: UserRole;
  exp: number;
}

export interface ConsumerAccount {
  id: string;
  tenant_id: string;
  folder_id: string;
  username: string;
  password_hash: string;
  last_login?: string;
  is_active: boolean;
}

export interface FolderListItem {
  id: string;
  client_name: string;
  nik?: string;
  phone?: string;
  created_at: string;
  catalog_code: string;
  current_milestone: string;
  progress_pct: number;
  is_vetoed: boolean;
  target_completion_date?: string;
  is_overdue?: boolean;
}

export interface PaginatedResponse<T> {
  total_records: number;
  current_page: number;
  data: T[];
}

export interface TenantSettings {
  tenant_id: string;
  is_white_label_enabled: boolean;
  is_ai_enabled: boolean;
  is_ai_ocr_enabled: boolean;
  is_ai_drafting_enabled: boolean;
  is_ai_audit_enabled: boolean;
  custom_wa_template?: string;
}

export interface Folder {
  id: string;
  tenant_id: string;
  name: string;
  current_milestone_id: string;
  needs_revision: boolean;
  target_completion_date?: string;
  is_overdue?: boolean;
  created_at: string;
  updated_at: string;
}

export interface OcrResult {
  type: 'KTP' | 'SERTIFIKAT' | 'UNKNOWN';
  data: {
    nik?: string;
    nama?: string;
    alamat?: string;
    no_hak?: string;
    luas?: string;
    pemilik?: string;
  };
  needs_manual_review: boolean;
}

export interface FolderActivity {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  folder_id: string;
  action_type: 'STATUS_CHANGE' | 'STATUS_ROLLBACK' | 'ASSET_UPLOAD' | 'SIGNING' | 'VERIFICATION';
  old_status?: string;
  new_status?: string;
  asset_name?: string;
  payload_change: any;
  created_at: string;
}
