import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import FormResponse, FormCreate, FormFieldResponse, FormFieldCreate, FormFieldBase
from formseva_app.core.database import db
from formseva_app.core.security import require_role

router = APIRouter(prefix="/forms", tags=["Forms & Dynamic Fields"])

@router.get("", response_model=List[FormResponse])
def list_forms(active_only: bool = True):
    """List all available Gujarat certificate forms."""
    forms_list = list(db.forms.values())
    if active_only:
        forms_list = [f for f in forms_list if f.get("is_active", True)]
    
    forms_list.sort(key=lambda x: x.get("sort_order", 0))
    
    result = []
    for f in forms_list:
        fields = [field for field in db.form_fields.values() if field["form_id"] == f["id"]]
        fields.sort(key=lambda x: x.get("sort_order", 0))
        result.append(FormResponse(**f, fields=fields))
    return result

@router.get("/{slug_or_id}", response_model=FormResponse)
def get_form_detail(slug_or_id: str):
    """Get complete form schema and dynamic fields for filling."""
    form = db.forms.get(slug_or_id)
    if not form:
        form = next((f for f in db.forms.values() if f["slug"] == slug_or_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Certificate form not found")
    
    fields = [field for field in db.form_fields.values() if field["form_id"] == form["id"]]
    fields.sort(key=lambda x: x.get("sort_order", 0))
    
    return FormResponse(**form, fields=fields)

@router.post("", response_model=FormResponse, dependencies=[Depends(require_role(["admin"]))])
def create_form(payload: FormCreate):
    """Admin endpoint to create a new government certificate form."""
    form_id = str(uuid.uuid4())
    form_data = payload.model_dump()
    form_data["id"] = form_id
    form_data["created_at"] = datetime.now(timezone.utc)
    form_data["updated_at"] = datetime.now(timezone.utc)
    
    db.forms[form_id] = form_data
    
    # Log audit
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "CREATE_FORM",
        "entity_type": "forms",
        "entity_id": form_id,
        "new_state": form_data,
        "created_at": datetime.now(timezone.utc)
    })
    
    return FormResponse(**form_data, fields=[])

@router.put("/{form_id}", response_model=FormResponse, dependencies=[Depends(require_role(["admin"]))])
def update_form(form_id: str, payload: FormCreate):
    """Admin endpoint to update form details."""
    form = db.forms.get(form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    old_state = dict(form)
    for k, v in payload.model_dump().items():
        form[k] = v
    form["updated_at"] = datetime.now(timezone.utc)
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "UPDATE_FORM",
        "entity_type": "forms",
        "entity_id": form_id,
        "old_state": old_state,
        "new_state": form,
        "created_at": datetime.now(timezone.utc)
    })
    
    fields = [field for field in db.form_fields.values() if field["form_id"] == form_id]
    fields.sort(key=lambda x: x.get("sort_order", 0))
    return FormResponse(**form, fields=fields)

@router.post("/{form_id}/fields", response_model=FormFieldResponse, dependencies=[Depends(require_role(["admin"]))])
def create_form_field(form_id: str, payload: FormFieldBase):
    """Admin endpoint to add a dynamic field to a form."""
    form = db.forms.get(form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    field_id = str(uuid.uuid4())
    field_data = payload.model_dump()
    field_data["id"] = field_id
    field_data["form_id"] = form_id
    field_data["created_at"] = datetime.now(timezone.utc)
    field_data["updated_at"] = datetime.now(timezone.utc)
    
    db.form_fields[field_id] = field_data
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "CREATE_FORM_FIELD",
        "entity_type": "form_fields",
        "entity_id": field_id,
        "new_state": field_data,
        "created_at": datetime.now(timezone.utc)
    })
    
    return FormFieldResponse(**field_data)

@router.delete("/fields/{field_id}", dependencies=[Depends(require_role(["admin"]))])
def delete_form_field(field_id: str):
    """Admin endpoint to remove a dynamic field."""
    if field_id not in db.form_fields:
        raise HTTPException(status_code=404, detail="Form field not found")
    
    deleted = db.form_fields.pop(field_id)
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "DELETE_FORM_FIELD",
        "entity_type": "form_fields",
        "entity_id": field_id,
        "old_state": deleted,
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Field deleted successfully"}
