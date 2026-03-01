// Types matching backend API

export interface User {
  id: string;
  email: string;
  name: string | null;
  emails: string[];
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  ats_account_id: string | null;
  job_title: string;
  company_name: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected';
  applied_at: string;
  last_updated: string;
  job_url: string | null;
  job_data: any;
  notes: string | null;
}

export interface ApplicationWithUpdates extends Application {
  updates: ApplicationUpdate[];
}

export interface ApplicationUpdate {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
}

export interface ATSAccount {
  id: string;
  platform: string;
  company_name: string;
  last_synced: string | null;
  sync_enabled: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  emails?: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SyncResponse {
  success: boolean;
  applications_synced: number;
  message: string;
}

export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  interview_date: string;
  interview_type: string | null;
  location: string | null;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  company_name?: string;
  job_title?: string;
}
