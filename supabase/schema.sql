-- =============================================================================
-- Form_Seva: Gujarat Government Certificate Assisted-Filing Platform
-- PostgreSQL / Supabase Database Schema with Row Level Security (RLS)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS (Citizens)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- References auth.users(id) in Supabase
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    preferred_language VARCHAR(5) DEFAULT 'gu' CHECK (preferred_language IN ('gu', 'hi', 'en')),
    aadhaar_last_four VARCHAR(4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. ADMINS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- References auth.users(id)
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'super_admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. OPERATORS (Filing Specialists)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- References auth.users(id)
    created_by_admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    district VARCHAR(100) DEFAULT 'Ahmedabad',
    assigned_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. FORMS (Certificate Types)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title_gu VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_gu TEXT,
    description_hi TEXT,
    description_en TEXT,
    department_name_gu VARCHAR(255),
    department_name_hi VARCHAR(255),
    department_name_en VARCHAR(255),
    official_fee NUMERIC(10, 2) DEFAULT 0.00,
    service_fee NUMERIC(10, 2) DEFAULT 99.00,
    turnaround_days INTEGER DEFAULT 3,
    expected_otp_count INTEGER DEFAULT 1,
    required_docs_json JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. FORM FIELDS (Dynamic Field Definition Engine)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    step_section VARCHAR(50) DEFAULT 'personal', -- 'personal', 'address', 'specific', 'documents'
    field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'select', 'date', 'textarea', 'radio', 'checkbox'
    label_gu VARCHAR(255) NOT NULL,
    label_hi VARCHAR(255) NOT NULL,
    label_en VARCHAR(255) NOT NULL,
    placeholder_gu VARCHAR(255),
    placeholder_hi VARCHAR(255),
    placeholder_en VARCHAR(255),
    help_text_gu TEXT,
    help_text_hi TEXT,
    help_text_en TEXT,
    options_json JSONB DEFAULT '[]'::jsonb,
    validation_regex VARCHAR(255),
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_form_field UNIQUE(form_id, field_key)
);

-- -----------------------------------------------------------------------------
-- 6. FORM SUBMISSIONS (Citizen Applications)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE RESTRICT,
    assigned_operator_id UUID REFERENCES public.operators(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (
        status IN (
            'draft',
            'submitted',
            'in_review',
            'operator_filling',
            'awaiting_otp',
            'otp_received',
            'submitted_to_govt_portal',
            'approved',
            'rejected'
        )
    ),
    govt_portal_application_id VARCHAR(100),
    govt_portal_url VARCHAR(255),
    rejection_reason TEXT,
    operator_notes TEXT,
    total_fee NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    operator_started_at TIMESTAMPTZ,
    govt_submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. SUBMISSION FIELD VALUES (Citizen Answers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submission_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    form_field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_submission_field UNIQUE(submission_id, form_field_id)
);

-- -----------------------------------------------------------------------------
-- 8. SUBMISSION DOCUMENTS (Uploaded Proofs Vault)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submission_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    document_type_key VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    storage_path VARCHAR(500) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. OTP REQUESTS (In-App Assisted Relay - DPDP & Google Play Compliant)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.otp_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    otp_sequence_number INTEGER DEFAULT 1,
    otp_purpose_gu VARCHAR(255) DEFAULT 'ડિજિટલ ગુજરાત પોર્ટલ લોગિન માટે',
    otp_purpose_hi VARCHAR(255) DEFAULT 'डिजिटल गुजरात पोर्टल लॉगिन हेतु',
    otp_purpose_en VARCHAR(255) DEFAULT 'For Digital Gujarat Portal Login',
    status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'submitted_by_citizen', 'verified', 'expired', 'cancelled')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. PAYMENTS (Stripe Integration & Audit)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_client_secret VARCHAR(255),
    amount_inr NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'inr',
    status VARCHAR(50) DEFAULT 'created' CHECK (status IN ('created', 'processing', 'succeeded', 'failed', 'refunded')),
    payment_method VARCHAR(50) DEFAULT 'card',
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. NOTIFICATIONS (In-App Push & Alerts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    title_gu VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    message_gu TEXT NOT NULL,
    message_hi TEXT NOT NULL,
    message_en TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'status_change',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. AUDIT LOG (Tamper-evident Action Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins WHERE auth_id = auth.uid() AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_operator() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.operators WHERE auth_id = auth.uid() AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Public forms viewable" ON public.forms
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin full access forms" ON public.forms
    FOR ALL USING (public.is_admin());

CREATE POLICY "Public form fields viewable" ON public.form_fields
    FOR SELECT USING (TRUE);

CREATE POLICY "Admin full access form fields" ON public.form_fields
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth_id = auth.uid() OR public.is_admin() OR public.is_operator());

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin manages operators" ON public.operators
    FOR ALL USING (public.is_admin());

CREATE POLICY "Operator view self" ON public.operators
    FOR SELECT USING (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Citizen view own submissions" ON public.form_submissions
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
        OR public.is_admin()
        OR (public.is_operator() AND (assigned_operator_id IN (SELECT id FROM public.operators WHERE auth_id = auth.uid()) OR assigned_operator_id IS NULL))
    );

CREATE POLICY "Citizen insert own submissions" ON public.form_submissions
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

CREATE POLICY "Operator and Admin update submissions" ON public.form_submissions
    FOR UPDATE USING (
        public.is_admin() 
        OR (public.is_operator() AND assigned_operator_id IN (SELECT id FROM public.operators WHERE auth_id = auth.uid()))
    );

CREATE POLICY "Submission values access" ON public.submission_field_values
    FOR ALL USING (
        submission_id IN (
            SELECT id FROM public.form_submissions 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
               OR public.is_admin()
               OR public.is_operator()
        )
    );

CREATE POLICY "Submission documents access" ON public.submission_documents
    FOR ALL USING (
        submission_id IN (
            SELECT id FROM public.form_submissions 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
               OR public.is_admin()
               OR public.is_operator()
        )
    );

CREATE POLICY "OTP requests viewable by owner and operator" ON public.otp_requests
    FOR ALL USING (
        submission_id IN (
            SELECT id FROM public.form_submissions 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
               OR public.is_admin()
               OR public.is_operator()
        )
    );

CREATE POLICY "Payments viewable by user and admin" ON public.payments
    FOR ALL USING (
        user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Notifications user self" ON public.notifications
    FOR ALL USING (
        user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
        OR public.is_admin()
    );

CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_operator ON public.form_submissions(assigned_operator_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_fields_form ON public.form_fields(form_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
