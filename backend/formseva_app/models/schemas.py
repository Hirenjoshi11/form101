from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class LanguageChoice(str):
    GU = "gu"
    HI = "hi"
    EN = "en"

class UserRole(str):
    CITIZEN = "citizen"
    OPERATOR = "operator"
    ADMIN = "admin"

# User Auth & Profile
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    preferred_language: str = "gu"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    role: str = "citizen"
    created_at: datetime
    aadhaar_last_four: Optional[str] = None

class AuthRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    role: Optional[str] = "citizen"  # Optional client hint; server-side database lookup determines true role (FS-C1)
    full_name: Optional[str] = None
    phone: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class GoogleAuthRequest(BaseModel):
    """Typed schema for Google OAuth login (FS-C2)."""
    id_token: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

# Form Field Models
class FormFieldOption(BaseModel):
    value: str
    label_gu: str
    label_hi: str
    label_en: str

class FormFieldBase(BaseModel):
    field_key: str
    step_section: str = "personal" # personal, address, specific, documents
    field_type: str # text, number, select, date, textarea, radio
    label_gu: str
    label_hi: str
    label_en: str
    placeholder_gu: Optional[str] = None
    placeholder_hi: Optional[str] = None
    placeholder_en: Optional[str] = None
    help_text_gu: Optional[str] = None
    help_text_hi: Optional[str] = None
    help_text_en: Optional[str] = None
    options_json: List[FormFieldOption] = []
    validation_regex: Optional[str] = None
    is_required: bool = True
    sort_order: int = 0

class FormFieldCreate(FormFieldBase):
    form_id: str

class FormFieldResponse(FormFieldBase):
    id: str
    form_id: str
    created_at: datetime

# Form Models
class RequiredDocItem(BaseModel):
    key: str
    label_gu: str
    label_hi: str
    label_en: str
    required: bool = True

class ServiceStepResponse(BaseModel):
    id: str
    form_id: str
    step_key: str
    step_number: int
    title_en: str
    title_gu: str
    title_hi: str
    description_en: Optional[str] = None
    description_gu: Optional[str] = None
    description_hi: Optional[str] = None

class ServiceDocumentResponse(BaseModel):
    id: str
    form_id: str
    document_type_key: str
    name_en: str
    name_gu: str
    name_hi: str
    required_level: str = "mandatory" # mandatory, conditional, optional, supporting
    condition_rule: Optional[Dict[str, Any]] = None
    accepted_formats: List[str] = ["PDF", "JPG", "PNG"]
    max_size_mb: int = 5
    why_needed_en: Optional[str] = None
    why_needed_gu: Optional[str] = None
    why_needed_hi: Optional[str] = None
    where_to_get_en: Optional[str] = None
    where_to_get_gu: Optional[str] = None
    where_to_get_hi: Optional[str] = None
    source_authority_en: Optional[str] = None
    source_authority_gu: Optional[str] = None
    source_authority_hi: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class RtoOfficeResponse(BaseModel):
    id: str
    rto_code: str
    district: str
    office_name_en: str
    office_name_gu: str
    office_name_hi: str
    address: str
    supported_services: List[str] = []
    is_active: bool = True

class DistrictGeoResponse(BaseModel):
    name_en: str
    name_gu: str
    name_hi: str
    talukas: List[str] = []

class FormBase(BaseModel):
    slug: str
    title_gu: str
    title_hi: str
    title_en: str
    description_gu: Optional[str] = None
    description_hi: Optional[str] = None
    description_en: Optional[str] = None
    department_name_gu: Optional[str] = None
    department_name_hi: Optional[str] = None
    department_name_en: Optional[str] = None
    official_fee: float = 0.0
    service_fee: float = 70.0
    turnaround_days: int = 2
    expected_otp_count: int = 1
    version: Optional[str] = None
    exam_year: Optional[int] = None
    bulletin_version: Optional[str] = None
    myth_en: Optional[str] = None
    myth_gu: Optional[str] = None
    fact_en: Optional[str] = None
    fact_gu: Optional[str] = None
    required_docs_json: List[RequiredDocItem] = []
    is_active: bool = True
    sort_order: int = 0

class FormCreate(FormBase):
    pass

class FormResponse(FormBase):
    id: str
    created_at: datetime
    fields: Optional[List[FormFieldResponse]] = []
    steps: Optional[List[ServiceStepResponse]] = []
    service_documents: Optional[List[ServiceDocumentResponse]] = []

# Submission Models
class SubmissionFieldValue(BaseModel):
    field_key: str
    field_value: Any

class SubmissionCreate(BaseModel):
    form_slug: str
    field_values: Dict[str, Any] # key -> value
    language: str = "gu"

class DocumentUploadMeta(BaseModel):
    document_type_key: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    storage_path: str

class OtpTriggerRequest(BaseModel):
    submission_id: str
    otp_purpose_gu: Optional[str] = "ડિજિટલ ગુજરાત પોર્ટલ લોગિન માટે"
    otp_purpose_hi: Optional[str] = "डिजिटल गुजरात पोर्टल लॉगिन हेतु"
    otp_purpose_en: Optional[str] = "For Digital Gujarat Portal Login"

class OtpSubmitRequest(BaseModel):
    otp_request_id: Optional[str] = None
    submission_id: Optional[str] = None
    otp_code: str # Citizen enters 4 or 6 digit code received via SMS

class SubmissionStatusUpdate(BaseModel):
    status: str
    operator_notes: Optional[str] = None
    govt_portal_application_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    certificate_url: Optional[str] = None
    certificate_file_name: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: str
    application_number: str
    user_id: str
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    form_id: str
    form_slug: str
    form_title_gu: str
    form_title_hi: str
    form_title_en: str
    assigned_operator_id: Optional[str] = None
    assigned_operator_name: Optional[str] = None
    status: str
    govt_portal_application_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    operator_notes: Optional[str] = None
    official_fee: Optional[float] = 0.0
    service_fee: Optional[float] = 0.0
    total_fee: float
    payment_status: str
    submitted_at: datetime
    resubmitted_at: Optional[datetime] = None
    operator_started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    certificate_url: Optional[str] = None
    certificate_file_name: Optional[str] = None
    field_values: Dict[str, Any] = {}
    documents: List[Dict[str, Any]] = []
    active_otp_request: Optional[Dict[str, Any]] = None

class SubmissionResubmitRequest(BaseModel):
    field_values: Dict[str, Any]
    resubmission_note: Optional[str] = None

# Payment Models
class CreatePaymentIntentRequest(BaseModel):
    submission_id: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount_inr: float
    currency: str = "inr"
    status: str

# Operator Model
class OperatorResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    district: str
    assigned_count: int = 0
    completed_count: int = 0
    is_active: bool = True
    assigned_forms: Optional[List[str]] = [] # list of form slugs or IDs

class OperatorCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    district: str = "Ahmedabad"
    assigned_forms: Optional[List[str]] = []

class OperatorUpdate(BaseModel):
    """Whitelisted fields for operator profile updates — prevents mass assignment."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    district: Optional[str] = None

# Operator Form Assignments
class OperatorFormAssignment(BaseModel):
    id: str
    operator_id: str
    operator_name: Optional[str] = None
    form_id: str
    form_slug: Optional[str] = None
    form_title_en: Optional[str] = None
    form_title_gu: Optional[str] = None
    is_active: bool = True
    assigned_at: datetime

class AssignOperatorFormRequest(BaseModel):
    operator_id: str
    form_id: str

class BatchAssignOperatorFormsRequest(BaseModel):
    operator_id: str
    form_ids: List[str]

class UpdateUserPhoneRequest(BaseModel):
    phone: str

# Notifications & Audit
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    submission_id: Optional[str] = None
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

class AuditLogItem(BaseModel):
    id: str
    actor_id: Optional[str] = None
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    created_at: datetime

# Citizen Feedback Models
class FeedbackCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    service_id: Optional[str] = "general" # 'general' or form slug
    feedback_type: str = "General Feedback" # General Feedback, Suggestion, Service Experience, Technical Problem, Payment Issue, Form/Application Issue, Other
    rating: int = Field(default=5, ge=1, le=5)
    message: str = Field(..., min_length=5, max_length=3000)

class FeedbackResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    service_id: str
    service_name: Optional[str] = "General Feedback"
    feedback_type: str
    rating: int
    message: str
    status: str = "NEW" # NEW, REVIEWED, RESOLVED, ARCHIVED
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class FeedbackStatusUpdate(BaseModel):
    status: str # NEW, REVIEWED, RESOLVED, ARCHIVED
    admin_notes: Optional[str] = None

