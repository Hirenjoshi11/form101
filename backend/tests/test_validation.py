import pytest
import sys
sys.path.insert(0, r"d:\Software\form1.1\backend")

from formseva_app.core.validation import validate_form_fields, ValidationError

def test_validation_mobile_number():
    form_def = {"slug": "income_certificate"}
    form_fields = [
        {
            "field_key": "mobile_number",
            "field_type": "number",
            "validation_regex": r"^[6-9]\d{9}$",
            "validation": {"is_integer": True},
            "is_required": True
        }
    ]
    
    # Valid mobile
    res = validate_form_fields({"mobile_number": "9876543210"}, form_def, form_fields)
    assert res["mobile_number"] == "9876543210"
    
    # Invalid mobile (starts with 5)
    with pytest.raises(ValidationError):
        validate_form_fields({"mobile_number": "5876543210"}, form_def, form_fields)
        
    # Invalid length
    with pytest.raises(ValidationError):
        validate_form_fields({"mobile_number": "987654321"}, form_def, form_fields)
        
def test_validation_ews_income():
    form_def = {"slug": "ews_certificate"}
    form_fields = [
        {
            "field_key": "gross_annual_income",
            "field_type": "number",
            "validation": {"is_integer": True, "min": 0, "max_ews": 800000},
            "is_required": True
        }
    ]
    
    # Valid income
    res = validate_form_fields({"gross_annual_income": "750000"}, form_def, form_fields)
    assert res["gross_annual_income"] == "750000"
    
    # Invalid income for EWS (> 8 Lakhs)
    with pytest.raises(ValidationError) as exc_info:
        validate_form_fields({"gross_annual_income": "850000"}, form_def, form_fields)
    
    assert "EWS" in exc_info.value.message_en or "Income exceeds" in exc_info.value.message_en

def test_validation_whitelist():
    form_def = {"slug": "income_certificate"}
    form_fields = [
        {
            "field_key": "mobile_number",
            "field_type": "number",
            "is_required": True
        }
    ]
    
    # Unknown field included
    with pytest.raises(ValidationError) as exc_info:
        validate_form_fields({"mobile_number": "9876543210", "hacker_field": "admin"}, form_def, form_fields)
        
    assert "not part of this form" in exc_info.value.message_en
