-- ============================================================================
-- FormSeva — Migration 001: add encryption/blind-index columns
-- ----------------------------------------------------------------------------
-- WHY: auth.py, submissions.py, and otp.py were migrated to Supabase with
-- envelope encryption. The live tables predate those columns, so every call to
-- those modules fails with: column "..." does not exist (PostgREST 42703).
--
-- This migration is IDEMPOTENT (ADD COLUMN IF NOT EXISTS) and safe to re-run.
-- It ONLY adds the missing columns confirmed against the live database.
--
-- HOW TO APPLY: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- (The REST/service-role key cannot run DDL; this must run as SQL.)
--
-- NOTE: This clears the "column does not exist" 500s, but does NOT by itself
-- make the app functional — the Supabase tables are still empty (no admins/
-- operators/forms) and the operators/admin/payments/feedback/forms modules
-- still read the in-memory store. See the conversation for the full plan.
-- ============================================================================

-- users: encrypted email/phone + blind index for lookups + envelope key
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_hash     VARCHAR(64);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wrapped_dek    TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider  VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role           VARCHAR(50) DEFAULT 'citizen';
-- unique blind index for exact-match email lookups (partial: ignores NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_hash
  ON public.users (email_hash) WHERE email_hash IS NOT NULL;

-- otp_requests: encrypted OTP value + envelope key + masked display
ALTER TABLE public.otp_requests ADD COLUMN IF NOT EXISTS otp_ciphertext        TEXT;
ALTER TABLE public.otp_requests ADD COLUMN IF NOT EXISTS wrapped_dek           TEXT;
ALTER TABLE public.otp_requests ADD COLUMN IF NOT EXISTS entered_code_display  VARCHAR(10);

-- form_submissions: envelope key for encrypted field values
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS wrapped_dek TEXT;

-- submission_field_values: envelope key (field_value already stores ciphertext)
ALTER TABLE public.submission_field_values ADD COLUMN IF NOT EXISTS wrapped_dek TEXT;

-- ============================================================================
-- Verify (optional): each should return without error after running above.
--   SELECT email_hash, wrapped_dek, auth_provider, role FROM public.users LIMIT 1;
--   SELECT otp_ciphertext, wrapped_dek, entered_code_display FROM public.otp_requests LIMIT 1;
--   SELECT wrapped_dek FROM public.form_submissions LIMIT 1;
--   SELECT wrapped_dek FROM public.submission_field_values LIMIT 1;
-- ============================================================================
