export interface FormFieldOption {
  value: string;
  label_gu: string;
  label_hi: string;
  label_en: string;
}

export interface FormField {
  id: string;
  form_id: string;
  field_key: string;
  step_section: string;
  field_type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'radio' | 'checkbox';
  label_gu: string;
  label_hi: string;
  label_en: string;
  placeholder_gu?: string;
  placeholder_hi?: string;
  placeholder_en?: string;
  help_text_gu?: string;
  help_text_hi?: string;
  help_text_en?: string;
  options_json?: FormFieldOption[];
  validation_regex?: string;
  validation?: Record<string, any>;
  is_required: boolean;
  sort_order: number;
}

export interface RequiredDocItem {
  key: string;
  label_gu: string;
  label_hi: string;
  label_en: string;
  required: boolean;
}

export interface ServiceStep {
  id: string;
  form_id: string;
  step_key: string;
  step_number: number;
  title_en: string;
  title_gu: string;
  title_hi: string;
  description_en?: string;
  description_gu?: string;
  description_hi?: string;
}

export interface ServiceDocument {
  id: string;
  form_id: string;
  document_type_key: string;
  name_en: string;
  name_gu: string;
  name_hi: string;
  required_level: 'mandatory' | 'conditional' | 'optional' | 'supporting';
  condition_rule?: Record<string, any>;
  accepted_formats: string[];
  max_size_mb: number;
  why_needed_en?: string;
  why_needed_gu?: string;
  why_needed_hi?: string;
  where_to_get_en?: string;
  where_to_get_gu?: string;
  where_to_get_hi?: string;
  source_authority_en?: string;
  source_authority_gu?: string;
  source_authority_hi?: string;
  is_active?: boolean;
  sort_order: number;
}

export interface RtoOffice {
  id: string;
  rto_code: string;
  district: string;
  office_name_en: string;
  office_name_gu: string;
  office_name_hi: string;
  address: string;
  supported_services: string[];
  is_active?: boolean;
}

export interface DistrictGeo {
  name_en: string;
  name_gu: string;
  name_hi: string;
  talukas: string[];
}

export interface CertificateForm {
  id: string;
  slug: string;
  title_gu: string;
  title_hi: string;
  title_en: string;
  description_gu: string;
  description_hi: string;
  description_en: string;
  department_name_gu: string;
  department_name_hi: string;
  department_name_en: string;
  official_fee: number;
  service_fee: number;
  turnaround_days: number;
  expected_otp_count: number;
  version?: string;
  exam_year?: number;
  bulletin_version?: string;
  required_docs_json: RequiredDocItem[];
  is_active: boolean;
  sort_order: number;
  myth_en?: string;
  myth_gu?: string;
  fact_en?: string;
  fact_gu?: string;
  fields?: FormField[];
  steps?: ServiceStep[];
  service_documents?: ServiceDocument[];
}

export interface SubmissionDocument {
  id: string;
  submission_id: string;
  document_type_key: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  storage_path: string;
  is_verified: boolean;
  created_at: string;
}

export interface OtpRequest {
  id: string;
  submission_id: string;
  operator_id: string;
  otp_sequence_number: number;
  otp_purpose_gu: string;
  otp_purpose_hi: string;
  otp_purpose_en: string;
  status: 'requested' | 'submitted_by_citizen' | 'verified' | 'expired' | 'cancelled';
  requested_at: string;
  submitted_at?: string;
  expires_at: string;
  entered_code_display?: string;
}

export interface FormSubmission {
  id: string;
  application_number: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  form_id: string;
  form_slug: string;
  form_title_gu: string;
  form_title_hi: string;
  form_title_en: string;
  assigned_operator_id?: string;
  assigned_operator_name?: string;
  status: 'draft' | 'submitted' | 'in_review' | 'operator_filling' | 'awaiting_otp' | 'otp_received' | 'submitted_to_govt_portal' | 'approved' | 'rejected' | 'correction_required' | 'resubmitted';
  govt_portal_application_id?: string;
  rejection_reason?: string;
  operator_notes?: string;
  official_fee?: number;
  service_fee?: number;
  total_fee: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  submitted_at: string;
  resubmitted_at?: string;
  operator_started_at?: string;
  completed_at?: string;
  certificate_url?: string;
  certificate_file_name?: string;
  field_values: Record<string, any>;
  documents: SubmissionDocument[];
  active_otp_request?: OtpRequest | null;
}

export interface Operator {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  district: string;
  assigned_count: number;
  completed_count: number;
  is_active: boolean;
  assigned_forms?: string[];
  assigned_form_ids?: string[];
}

export interface OperatorFormAssignment {
  id: string;
  operator_id: string;
  operator_name?: string;
  form_id: string;
  form_slug?: string;
  form_title_en?: string;
  form_title_gu?: string;
  is_active: boolean;
  assigned_at?: string;
}

export interface AdminStats {
  total_submissions: number;
  completed_submissions: number;
  in_progress: number;
  pending_payment: number;
  total_revenue_inr: number;
  active_operators_count: number;
  by_form: Record<string, { title_gu: string; title_en: string; count: number }>;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  submission_id?: string;
  title_gu: string;
  title_hi: string;
  title_en: string;
  message_gu: string;
  message_hi: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_state?: any;
  new_state?: any;
  client_ip?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  full_name_gu: string;
  email: string;
  phone: string;
  district: string;
  taluka: string;
  village: string;
  residential_address: string;
  pincode: string;
  gender: 'male' | 'female';
  dob: string;
  father_husband_name: string;
  occupation: string;
  annual_income: number;
  category: string;
  role: 'citizen' | 'operator' | 'admin';
  total_applications: number;
  recent_form_title?: string;
}

export interface FeedbackItem {
  id: string;
  user_id?: string | null;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  service_id: string;
  service_name?: string | null;
  feedback_type: string;
  rating: number;
  message: string;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED' | 'ARCHIVED';
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface FeedbackCreatePayload {
  name?: string;
  email?: string;
  mobile?: string;
  service_id?: string;
  feedback_type: string;
  rating: number;
  message: string;
}

export interface FeedbackFilterOptions {
  status?: string;
  feedback_type?: string;
  rating?: number;
  service_id?: string;
  search?: string;
}

// -----------------------------------------------------------------------------
// Financial, Revenue & Remittance Analytics Types
// -----------------------------------------------------------------------------

export interface BillingSummary {
  gross_revenue: number;
  portal_earnings: number;
  govt_remittance: number;
  total_transactions: number;
  successful_count: number;
  pending_count: number;
  failed_count: number;
  refunded_count: number;
  avg_order_value: number;
  success_rate: number;
  pending_settlement: number;
  period?: { from_date?: string; to_date?: string };
}

export interface DailyRevenueRecord {
  date: string;
  day: string;
  weekday: string;
  gross: number;
  govt: number;
  portal: number;
  txns: number;
  successful_txns: number;
}

export interface MonthlyRevenueRecord {
  month_num: number;
  month: string;
  monthShort: string;
  gross: number;
  govt: number;
  portal: number;
  txns: number;
}

export interface ServiceRevenueBreakdown {
  slug: string;
  name: string;
  name_gu?: string;
  revenue: number;
  govt_fee: number;
  portal_fee: number;
  count: number;
  percentage: number;
  color?: string;
}

export interface PlatformProfitRecord {
  service_id: string;
  service_slug: string;
  service_title_en: string;
  service_title_gu: string;
  department_name_en: string;
  department_name_gu: string;
  applications_count: number;
  unit_service_fee: number;
  gross_platform_revenue: number;
  operator_payout_expense: number;
  net_platform_profit: number;
  profit_margin_percentage: number;
  profit_share_percentage: number;
}

export interface GovtRemittanceRecord {
  id: string;
  department_name_en: string;
  department_name_gu: string;
  portal_name: string;
  service_slug: string;
  service_title_en: string;
  service_title_gu: string;
  unit_govt_fee: number;
  applications_remitted: number;
  total_remitted_inr: number;
  treasury_head_code: string;
  remittance_status: 'remitted' | 'settled' | 'pending' | 'verified';
  settlement_gateway: string;
  last_settlement_date: string;
}

export interface BillingTransaction {
  id: string;
  invoice_no: string;
  submission_id?: string;
  application_number: string;
  date: string;
  citizen_name: string;
  citizen_phone: string;
  district: string;
  form_slug: string;
  form_title_en: string;
  form_title_gu?: string;
  govt_fee: number;
  portal_fee: number;
  total_fee: number;
  payment_method: 'upi' | 'card' | 'netbanking' | 'qr' | string;
  payment_reference?: string;
  operator_name?: string;
  status: 'paid' | 'succeeded' | 'pending' | 'failed' | 'refunded';
  receipt_url?: string;
}

