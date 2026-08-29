import { CertificateForm, FormField, FormSubmission, Operator, FeedbackItem } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocpvsnfgyejzyoiyecxr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_lFk6muiNNB5sFCtMAbSOSA_sBAM77Oz';

const getHeaders = (preferReturn: boolean = true) => {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
  if (preferReturn) {
    headers['Prefer'] = 'return=representation';
  }
  return headers;
};

export class SupabaseRestService {
  // FORMS
  static async getForms(): Promise<CertificateForm[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/forms?select=*&order=sort_order.asc`, {
      headers: getHeaders(false)
    });
    if (!res.ok) throw new Error(`Supabase error ${res.status}: ${res.statusText}`);
    const forms: CertificateForm[] = await res.json();

    // Fetch fields
    try {
      const fieldsRes = await fetch(`${SUPABASE_URL}/rest/v1/form_fields?select=*&order=sort_order.asc`, {
        headers: getHeaders(false)
      });
      if (fieldsRes.ok) {
        const fields: FormField[] = await fieldsRes.json();
        return forms.map(f => ({
          ...f,
          fields: fields.filter(field => field.form_id === f.id)
        }));
      }
    } catch {}

    return forms;
  }

  static async updateForm(formId: string, payload: Partial<CertificateForm>): Promise<CertificateForm> {
    const allowedKeys = [
      'title_en', 'title_gu', 'title_hi',
      'description_en', 'description_gu', 'description_hi',
      'department_name_en', 'department_name_gu', 'department_name_hi',
      'service_fee', 'official_fee', 'turnaround_days', 'expected_otp_count',
      'is_active', 'category', 'myth_en', 'myth_gu', 'fact_en', 'fact_gu',
      'sort_order', 'exam_year'
    ];

    const cleanPayload: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (key in payload && (payload as any)[key] !== undefined) {
        cleanPayload[key] = (payload as any)[key];
      }
    }
    cleanPayload['updated_at'] = new Date().toISOString();

    const res = await fetch(`${SUPABASE_URL}/rest/v1/forms?or=(id.eq.${formId},slug.eq.${formId})`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(cleanPayload)
    });

    if (!res.ok) throw new Error(`Failed to update form in Supabase: ${res.statusText}`);
    const updated = await res.json();
    return updated[0] || (payload as CertificateForm);
  }

  // OPERATORS
  static async getOperators(): Promise<Operator[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/operators?select=*`, {
      headers: getHeaders(false)
    });
    if (!res.ok) throw new Error(`Failed to fetch operators: ${res.statusText}`);
    const ops: Operator[] = await res.json();

    // Fetch assignments
    try {
      const assignRes = await fetch(`${SUPABASE_URL}/rest/v1/operator_form_assignments?select=*`, {
        headers: getHeaders(false)
      });
      if (assignRes.ok) {
        const assigns = await assignRes.json();
        return ops.map(op => {
          const assignedIds = assigns
            .filter((a: any) => a.operator_id === op.id && a.is_active !== false)
            .map((a: any) => a.form_id);
          return {
            ...op,
            assigned_form_ids: assignedIds
          };
        });
      }
    } catch {}

    return ops;
  }

  static async updateOperator(opId: string, payload: Partial<Operator>): Promise<Operator> {
    const clean: Record<string, any> = { ...payload };
    delete clean.assigned_forms;
    delete clean.assigned_form_ids;
    clean['updated_at'] = new Date().toISOString();

    const res = await fetch(`${SUPABASE_URL}/rest/v1/operators?id=eq.${opId}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(clean)
    });
    if (!res.ok) throw new Error(`Failed to update operator: ${res.statusText}`);
    const updated = await res.json();
    return updated[0];
  }

  static async updateOperatorAssignments(operatorId: string, formIds: string[]): Promise<void> {
    // 1. Delete existing assignments
    await fetch(`${SUPABASE_URL}/rest/v1/operator_form_assignments?operator_id=eq.${operatorId}`, {
      method: 'DELETE',
      headers: getHeaders(false)
    });

    // 2. Insert new assignments
    if (formIds.length > 0) {
      const rows = formIds.map(fid => ({
        operator_id: operatorId,
        form_id: fid,
        is_active: true,
        created_at: new Date().toISOString()
      }));
      await fetch(`${SUPABASE_URL}/rest/v1/operator_form_assignments`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(rows)
      });
    }
  }

  // SUBMISSIONS
  static async getSubmissions(): Promise<FormSubmission[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions?select=*&order=created_at.desc`, {
      headers: getHeaders(false)
    });
    if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.statusText}`);
    return await res.json();
  }

  static async createSubmission(submission: Partial<FormSubmission>): Promise<FormSubmission> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        ...submission,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error(`Failed to create submission: ${res.statusText}`);
    const created = await res.json();
    return created[0];
  }

  static async updateSubmission(submissionId: string, payload: Partial<FormSubmission>): Promise<FormSubmission> {
    const clean: Record<string, any> = {
      ...payload,
      updated_at: new Date().toISOString()
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions?id=eq.${submissionId}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(clean)
    });
    if (!res.ok) throw new Error(`Failed to update submission: ${res.statusText}`);
    const updated = await res.json();
    return updated[0];
  }

  // FEEDBACK
  static async getFeedback(): Promise<FeedbackItem[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/citizen_feedback?select=*&order=created_at.desc`, {
      headers: getHeaders(false)
    });
    if (!res.ok) throw new Error(`Failed to fetch feedback: ${res.statusText}`);
    return await res.json();
  }

  static async createFeedback(item: Partial<FeedbackItem>): Promise<FeedbackItem> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/citizen_feedback`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        ...item,
        created_at: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error(`Failed to submit feedback: ${res.statusText}`);
    const created = await res.json();
    return created[0];
  }

  static async updateFeedback(id: string, payload: Partial<FeedbackItem>): Promise<FeedbackItem> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/citizen_feedback?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({
        ...payload,
        updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error(`Failed to update feedback: ${res.statusText}`);
    const updated = await res.json();
    return updated[0];
  }
}
