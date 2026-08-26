import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import (
    FormResponse, FormCreate, FormFieldResponse, FormFieldCreate, FormFieldBase,
    ServiceStepResponse, ServiceDocumentResponse, RtoOfficeResponse, DistrictGeoResponse
)
from formseva_app.core.database import db
from formseva_app.core.security import require_role

router = APIRouter(prefix="/forms", tags=["Forms & Dynamic Fields"])

@router.get("/rto/offices", response_model=List[RtoOfficeResponse])
def get_rto_offices(district: Optional[str] = None, service: Optional[str] = None):
    """List Gujarat RTO/ARTO transport offices (GJ-01 to GJ-39)."""
    offices = list(db.rto_offices.values())
    if district:
        offices = [o for o in offices if o["district"].lower() == district.lower()]
    if service:
        offices = [o for o in offices if service.lower() in [s.lower() for s in o.get("supported_services", [])]]
    offices.sort(key=lambda x: x.get("rto_code", ""))
    return offices

@router.get("/geography/districts", response_model=Dict[str, DistrictGeoResponse])
def get_gujarat_districts():
    """Get all 33 Gujarat administrative districts with their respective taluka lists."""
    return db.geography_districts

@router.get("", response_model=List[FormResponse])
def list_forms(active_only: bool = True):
    """List all available Gujarat certificate forms with steps and document rules."""
    forms_list = list(db.forms.values())
    if active_only:
        forms_list = [f for f in forms_list if f.get("is_active", True)]
    
    forms_list.sort(key=lambda x: x.get("sort_order", 0))
    
    result = []
    for f in forms_list:
        fields = [field for field in db.form_fields.values() if field["form_id"] == f["id"]]
        fields.sort(key=lambda x: x.get("sort_order", 0))
        
        steps = [step for step in db.service_steps.values() if step["form_id"] == f["id"]]
        steps.sort(key=lambda x: x.get("step_number", 0))
        
        docs = [doc for doc in db.service_documents.values() if doc["form_id"] == f["id"] and doc.get("is_active", True)]
        docs.sort(key=lambda x: x.get("sort_order", 0))
        
        result.append(FormResponse(**f, fields=fields, steps=steps, service_documents=docs))
    return result

@router.get("/{slug_or_id}", response_model=FormResponse)
def get_form_detail(slug_or_id: str):
    """Get complete form schema, steps, dynamic fields, and conditional document rules."""
    form = db.forms.get(slug_or_id)
    if not form:
        form = next((f for f in db.forms.values() if f["slug"] == slug_or_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Certificate form not found")
    
    fields = [field for field in db.form_fields.values() if field["form_id"] == form["id"]]
    fields.sort(key=lambda x: x.get("sort_order", 0))
    
    steps = [step for step in db.service_steps.values() if step["form_id"] == form["id"]]
    steps.sort(key=lambda x: x.get("step_number", 0))
    
    docs = [doc for doc in db.service_documents.values() if doc["form_id"] == form["id"] and doc.get("is_active", True)]
    docs.sort(key=lambda x: x.get("sort_order", 0))
    
    return FormResponse(**form, fields=fields, steps=steps, service_documents=docs)

@router.get("/{slug_or_id}/documents", response_model=List[ServiceDocumentResponse])
def get_form_documents(slug_or_id: str):
    """Get full document requirement matrix (Mandatory, Conditional, Where to Get, Formats) for public /documents page."""
    form = db.forms.get(slug_or_id)
    if not form:
        form = next((f for f in db.forms.values() if f["slug"] == slug_or_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Certificate form not found")
    
    docs = [doc for doc in db.service_documents.values() if doc["form_id"] == form["id"] and doc.get("is_active", True)]
    docs.sort(key=lambda x: x.get("sort_order", 0))
    return docs

@router.get("/{slug_or_id}/steps", response_model=List[ServiceStepResponse])
def get_form_steps(slug_or_id: str):
    """Get configured steps for a specific service."""
    form = db.forms.get(slug_or_id)
    if not form:
        form = next((f for f in db.forms.values() if f["slug"] == slug_or_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Certificate form not found")
    
    steps = [step for step in db.service_steps.values() if step["form_id"] == form["id"]]
    steps.sort(key=lambda x: x.get("step_number", 0))
    return steps

@router.post("", response_model=FormResponse, dependencies=[Depends(require_role(["admin"]))])
def create_form(payload: FormCreate):
    """Admin endpoint to create a new government certificate form."""
    form_id = str(uuid.uuid4())
    form_data = payload.model_dump()
    form_data["id"] = form_id
    form_data["created_at"] = datetime.now(timezone.utc)
    form_data["updated_at"] = datetime.now(timezone.utc)
    
    db.forms[form_id] = form_data
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "CREATE_FORM",
        "entity_type": "forms",
        "entity_id": form_id,
        "new_state": form_data,
        "created_at": datetime.now(timezone.utc)
    })
    
    return FormResponse(**form_data, fields=[], steps=[], service_documents=[])

@router.put("/{form_id}", response_model=FormResponse, dependencies=[Depends(require_role(["admin"]))])
def update_form(form_id: str, payload: FormCreate):
    """Admin endpoint to update form details, service fees, or turning days."""
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
    steps = [step for step in db.service_steps.values() if step["form_id"] == form_id]
    steps.sort(key=lambda x: x.get("step_number", 0))
    docs = [doc for doc in db.service_documents.values() if doc["form_id"] == form_id and doc.get("is_active", True)]
    docs.sort(key=lambda x: x.get("sort_order", 0))
    
    return FormResponse(**form, fields=fields, steps=steps, service_documents=docs)

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

@router.patch("/{form_id}/toggle-active", response_model=FormResponse, dependencies=[Depends(require_role(["admin"]))])
def toggle_form_active(form_id: str):
    """Admin endpoint to toggle active/inactive status (show/hide form for citizens)."""
    form = db.forms.get(form_id)
    if not form:
        form = next((f for f in db.forms.values() if f.get("slug") == form_id or f.get("id") == form_id), None)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    old_state = dict(form)
    form["is_active"] = not form.get("is_active", True)
    form["updated_at"] = datetime.now(timezone.utc)
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "TOGGLE_FORM_ACTIVE",
        "entity_type": "forms",
        "entity_id": form["id"],
        "old_state": old_state,
        "new_state": form,
        "created_at": datetime.now(timezone.utc)
    })
    
    fields = [field for field in db.form_fields.values() if field["form_id"] == form["id"]]
    fields.sort(key=lambda x: x.get("sort_order", 0))
    steps = [step for step in db.service_steps.values() if step["form_id"] == form["id"]]
    steps.sort(key=lambda x: x.get("step_number", 0))
    docs = [doc for doc in db.service_documents.values() if doc["form_id"] == form["id"] and doc.get("is_active", True)]
    docs.sort(key=lambda x: x.get("sort_order", 0))
    
    return FormResponse(**form, fields=fields, steps=steps, service_documents=docs)

@router.delete("/{form_id}", dependencies=[Depends(require_role(["admin"]))])
def delete_form(form_id: str):
    """Admin endpoint to permanently delete a form."""
    form = db.forms.pop(form_id, None)
    if not form:
        form_key = next((k for k, v in db.forms.items() if v.get("slug") == form_id or v.get("id") == form_id), None)
        if form_key:
            form = db.forms.pop(form_key, None)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "DELETE_FORM",
        "entity_type": "forms",
        "entity_id": form["id"],
        "old_state": form,
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Form deleted successfully"}

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
