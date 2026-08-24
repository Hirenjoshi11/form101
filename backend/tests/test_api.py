import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_and_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Form_Seva Gujarat Certificate Assisted-Filing API"
    assert "gu" in data["supported_languages"]

def test_list_forms_trilingual():
    response = client.get("/api/v1/forms")
    assert response.status_code == 200
    forms = response.json()
    assert len(forms) >= 5
    
    income_form = next((f for f in forms if f["slug"] == "income_certificate"), None)
    assert income_form is not None
    assert income_form["title_gu"] == "આવકનું પ્રમાણપત્ર"
    assert income_form["title_hi"] == "आय प्रमाण पत्र"
    assert income_form["title_en"] == "Income Certificate"
    assert len(income_form["fields"]) > 0

def test_auth_citizen_and_operator_tokens():
    # Citizen Login
    cit_res = client.post("/api/v1/auth/login", json={
        "email": "test.citizen@gujarat.in",
        "full_name": "Hareshbhai Patel",
        "role": "citizen"
    })
    assert cit_res.status_code == 200
    cit_data = cit_res.json()
    assert "access_token" in cit_data
    assert cit_data["user"]["role"] == "citizen"

    # Admin Login
    admin_res = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "role": "admin"
    })
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["user"]["role"] == "admin"

def test_end_to_end_submission_and_otp_flow():
    # 1. Citizen creates Income Certificate submission
    cit_token = client.post("/api/v1/auth/login", json={
        "email": "citizen.flow@example.com",
        "full_name": "Jitubhai Vaghela",
        "role": "citizen"
    }).json()["access_token"]
    
    headers = {"Authorization": f"Bearer {cit_token}"}
    
    sub_res = client.post("/api/v1/submissions", json={
        "form_slug": "income_certificate",
        "field_values": {
            "applicant_name": "Jitubhai Vaghela",
            "father_husband_name": "Sureshbhai Vaghela",
            "gender": "male",
            "dob": "1992-04-10",
            "mobile_number": "9876543210",
            "district": "Ahmedabad",
            "taluka": "Daskroi",
            "annual_income": "95000",
            "income_purpose": "scholarship"
        }
    }, headers=headers)
    
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    sub_id = sub_data["id"]
    assert sub_data["status"] == "submitted"
    assert sub_data["total_fee"] == 70.00
    
    # 2. Operator logs in and views queue
    op_token = client.post("/api/v1/auth/login", json={
        "email": "vicky.operator@formseva.in",
        "role": "operator"
    }).json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    
    queue_res = client.get("/api/v1/operator/queue", headers=op_headers)
    assert queue_res.status_code == 200
    
    # 3. Operator starts filing -> triggers citizen alert
    start_res = client.post(f"/api/v1/operator/submissions/{sub_id}/start", headers=op_headers)
    assert start_res.status_code == 200
    assert start_res.json()["submission"]["status"] == "operator_filling"
    
    # 4. Operator triggers In-App OTP
    otp_trigger_res = client.post("/api/v1/otp/trigger", json={
        "submission_id": sub_id,
        "otp_purpose_gu": "ડિજિટલ ગુજરાત e-KYC માટે",
        "otp_purpose_en": "For Digital Gujarat e-KYC"
    }, headers=op_headers)
    assert otp_trigger_res.status_code == 200
    otp_req_id = otp_trigger_res.json()["otp_request"]["id"]
    
    # 5. Citizen enters OTP in-app
    otp_submit_res = client.post("/api/v1/otp/submit", json={
        "otp_request_id": otp_req_id,
        "otp_code": "847291"
    }, headers=headers)
    assert otp_submit_res.status_code == 200
    assert otp_submit_res.json()["otp_request"]["status"] == "submitted_by_citizen"
    
    # 6. Operator marks filing complete on govt portal
    update_res = client.post(f"/api/v1/operator/submissions/{sub_id}/update-status", json={
        "status": "submitted_to_govt_portal",
        "govt_portal_application_id": "GJ-REV-2026-90412"
    }, headers=op_headers)
    assert update_res.status_code == 200
    assert update_res.json()["submission"]["status"] == "submitted_to_govt_portal"

def test_stripe_payment_simulation():
    cit_token = client.post("/api/v1/auth/login", json={
        "email": "pay.test@example.com",
        "full_name": "Maheshbhai",
        "role": "citizen"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {cit_token}"}
    
    sub = client.post("/api/v1/submissions", json={
        "form_slug": "land_records_7_12",
        "field_values": {"district": "Surat", "survey_number": "88"}
    }, headers=headers).json()
    
    # Create Payment Intent
    pi_res = client.post("/api/v1/payments/create-intent", json={
        "submission_id": sub["id"]
    }, headers=headers)
    assert pi_res.status_code == 200
    pi_data = pi_res.json()
    assert "client_secret" in pi_data
    assert pi_data["amount_inr"] == 65.00 # 15 + 50
    
    # Confirm Payment
    conf_res = client.post(f"/api/v1/payments/confirm-mock/{pi_data['payment_intent_id']}", headers=headers)
    assert conf_res.status_code == 200
    assert conf_res.json()["payment"]["status"] == "succeeded"

def test_admin_stats_and_operator_management():
    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "role": "admin"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    stats_res = client.get("/api/v1/admin/dashboard-stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_submissions" in stats
    assert stats["active_operators_count"] >= 4
    
    # Create 5th operator
    new_op = client.post("/api/v1/admin/operators", json={
        "full_name": "Chirag Suthar",
        "email": "chirag.operator@formseva.in",
        "phone": "+91 98254 55667",
        "district": "Gandhinagar"
    }, headers=headers)
    assert new_op.status_code == 200
    assert new_op.json()["full_name"] == "Chirag Suthar"
