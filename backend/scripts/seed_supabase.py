import os
import sys
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from formseva_app.core.supabase_client import get_supabase_admin_client
from formseva_app.core.database import db

def seed_supabase():
    supabase = get_supabase_admin_client()
    if not supabase:
        print("[ERROR] Could not connect to Supabase with service role key.")
        return False

    print("[1/7] Seeding admins...")
    for admin_id, admin in db.admins.items():
        admin_data = {
            "id": admin["id"],
            "full_name": admin["full_name"],
            "email": admin["email"],
            "role": admin.get("role", "super_admin"),
            "is_active": admin.get("is_active", True),
            "created_at": admin["created_at"].isoformat() if isinstance(admin["created_at"], datetime) else admin["created_at"]
        }
        res = supabase.table("admins").upsert(admin_data).execute()
        print(f"  Upserted admin: {admin['email']}")

    print("[2/7] Seeding operators...")
    for op_id, op in db.operators.items():
        op_data = {
            "id": op["id"],
            "full_name": op["full_name"],
            "email": op["email"],
            "phone": op.get("phone"),
            "district": op.get("district", "Ahmedabad"),
            "assigned_count": op.get("assigned_count", 0),
            "completed_count": op.get("completed_count", 0),
            "created_by_admin_id": op.get("created_by_admin_id"),
            "is_active": op.get("is_active", True),
            "created_at": op["created_at"].isoformat() if isinstance(op["created_at"], datetime) else op["created_at"]
        }
        res = supabase.table("operators").upsert(op_data).execute()
        print(f"  Upserted operator: {op['full_name']} ({op['email']})")

    print("[3/7] Seeding forms...")
    for form_id, form in db.forms.items():
        form_data = {
            "id": form["id"],
            "slug": form["slug"],
            "title_gu": form["title_gu"],
            "title_hi": form["title_hi"],
            "title_en": form["title_en"],
            "description_gu": form["description_gu"],
            "description_hi": form["description_hi"],
            "description_en": form["description_en"],
            "department_name_gu": form["department_name_gu"],
            "department_name_hi": form["department_name_hi"],
            "department_name_en": form["department_name_en"],
            "official_fee": float(form["official_fee"]),
            "service_fee": float(form["service_fee"]),
            "turnaround_days": form["turnaround_days"],
            "expected_otp_count": form["expected_otp_count"],
            "version": form.get("version"),
            "exam_year": form.get("exam_year"),
            "bulletin_version": form.get("bulletin_version"),
            "myth_en": form.get("myth_en"),
            "myth_gu": form.get("myth_gu"),
            "fact_en": form.get("fact_en"),
            "fact_gu": form.get("fact_gu"),
            "is_active": form.get("is_active", True),
            "sort_order": form.get("sort_order", 1),
            "created_at": form["created_at"].isoformat() if isinstance(form["created_at"], datetime) else form["created_at"],
            "updated_at": form["updated_at"].isoformat() if isinstance(form["updated_at"], datetime) else form["updated_at"]
        }
        res = supabase.table("forms").upsert(form_data).execute()
        print(f"  Upserted form: {form['slug']}")

    print("[4/7] Seeding form fields...")
    for f_id, field in db.form_fields.items():
        field_data = {
            "id": field["id"],
            "form_id": field["form_id"],
            "field_key": field["field_key"],
            "step_section": field["step_section"],
            "field_type": field["field_type"],
            "label_gu": field["label_gu"],
            "label_hi": field["label_hi"],
            "label_en": field["label_en"],
            "placeholder_gu": field.get("placeholder_gu"),
            "placeholder_hi": field.get("placeholder_hi"),
            "placeholder_en": field.get("placeholder_en"),
            "help_text_gu": field.get("help_text_gu"),
            "help_text_hi": field.get("help_text_hi"),
            "help_text_en": field.get("help_text_en"),
            "options_json": field.get("options_json"),
            "validation_regex": field.get("validation_regex"),
            "validation": field.get("validation"),
            "is_required": field.get("is_required", True),
            "sort_order": field.get("sort_order", 1),
            "created_at": field["created_at"].isoformat() if isinstance(field["created_at"], datetime) else field["created_at"]
        }
        supabase.table("form_fields").upsert(field_data).execute()
    print(f"  Upserted {len(db.form_fields)} form fields.")

    print("[5/7] Seeding service steps...")
    for s_id, step in db.service_steps.items():
        step_data = {
            "id": step["id"],
            "form_id": step["form_id"],
            "step_key": step["step_key"],
            "step_number": step["step_number"],
            "title_gu": step["title_gu"],
            "title_hi": step["title_hi"],
            "title_en": step["title_en"],
            "description_gu": step.get("description_gu"),
            "description_hi": step.get("description_hi"),
            "description_en": step.get("description_en"),
            "created_at": step["created_at"].isoformat() if isinstance(step["created_at"], datetime) else step["created_at"]
        }
        supabase.table("service_steps").upsert(step_data).execute()
    print(f"  Upserted {len(db.service_steps)} service steps.")

    print("[6/7] Seeding service documents...")
    for d_id, doc in db.service_documents.items():
        doc_data = {
            "id": doc["id"],
            "form_id": doc["form_id"],
            "document_type_key": doc["document_type_key"],
            "name_gu": doc["name_gu"],
            "name_hi": doc["name_hi"],
            "name_en": doc["name_en"],
            "required_level": doc.get("required_level", "mandatory"),
            "condition_rule": doc.get("condition_rule"),
            "accepted_formats": doc.get("accepted_formats", ["pdf", "jpg", "jpeg", "png"]),
            "max_size_mb": doc.get("max_size_mb", 5),
            "why_needed_gu": doc.get("why_needed_gu"),
            "why_needed_hi": doc.get("why_needed_hi"),
            "why_needed_en": doc.get("why_needed_en"),
            "where_to_get_gu": doc.get("where_to_get_gu"),
            "where_to_get_hi": doc.get("where_to_get_hi"),
            "where_to_get_en": doc.get("where_to_get_en"),
            "source_authority_gu": doc.get("source_authority_gu"),
            "source_authority_hi": doc.get("source_authority_hi"),
            "source_authority_en": doc.get("source_authority_en"),
            "is_active": doc.get("is_active", True),
            "sort_order": doc.get("sort_order", 1),
            "created_at": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"]
        }
        supabase.table("service_documents").upsert(doc_data).execute()
    print(f"  Upserted {len(db.service_documents)} service documents.")

    print("[7/7] Seeding operator form assignments...")
    for a_id, assign in db.operator_form_assignments.items():
        assign_data = {
            "id": assign["id"],
            "operator_id": assign["operator_id"],
            "form_id": assign["form_id"],
            "is_active": assign.get("is_active", True),
            "created_at": assign["created_at"].isoformat() if isinstance(assign["created_at"], datetime) else assign["created_at"]
        }
        supabase.table("operator_form_assignments").upsert(assign_data).execute()
    print(f"  Upserted {len(db.operator_form_assignments)} operator form assignments.")

    print("[SUCCESS] All master tables seeded into Supabase successfully.")
    return True

if __name__ == "__main__":
    seed_supabase()
