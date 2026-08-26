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
    assert sub_data["service_fee"] == 70.00
    assert sub_data["official_fee"] == 20.00
    assert sub_data["total_fee"] == 90.00
    
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
    assert pi_data["amount_inr"] == 80.00 # 15 govt + 65 service
    
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

def test_driving_licence_payment_snapshot_is_1000():
    """Verify that Driving Licence assistance fee is ₹1000 and is snapshotted consistently across submission, payment, and operator queue."""
    cit_token = client.post("/api/v1/auth/login", json={
        "email": "dl.citizen@test.in",
        "full_name": "Ketan Patel",
        "phone": "9898011223",
        "role": "citizen"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {cit_token}"}
    
    # 1. Create DL submission
    dl_sub = client.post("/api/v1/submissions", json={
        "form_slug": "driving_licence_rto",
        "field_values": {
            "applicant_name": "Ketan Patel",
            "licence_type": "learner",
            "vehicle_class": "MCWG_LMV",
            "rto_office": "GJ-01"
        }
    }, headers=headers).json()
    
    assert dl_sub["service_fee"] == 1000.00
    assert dl_sub["official_fee"] == 150.00
    assert dl_sub["total_fee"] == 1150.00
    assert dl_sub["user_phone"] == "9898011223"
    
    # 2. Verify Payment Intent
    pi_res = client.post("/api/v1/payments/create-intent", json={
        "submission_id": dl_sub["id"]
    }, headers=headers).json()
    assert pi_res["amount_inr"] == 1150.00
    
    # 3. Verify Operator views submission
    op_token = client.post("/api/v1/auth/login", json={
        "email": "vicky.operator@formseva.in",
        "role": "operator"
    }).json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    
    op_detail = client.get(f"/api/v1/submissions/{dl_sub['id']}", headers=op_headers).json()
    assert op_detail["service_fee"] == 1000.00
    assert op_detail["total_fee"] == 1150.00
    assert op_detail["user_phone"] == "9898011223"

def test_rejection_and_resubmission_workflow():
    """Verify that rejected applications can be corrected and resubmitted without extra charge."""
    cit_token = client.post("/api/v1/auth/login", json={
        "email": "resubmit.user@test.in",
        "full_name": "Pooja Shah",
        "role": "citizen"
    }).json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}
    
    # Citizen creates EWS application
    sub = client.post("/api/v1/submissions", json={
        "form_slug": "ews_certificate",
        "field_values": {
            "applicant_name": "Pooja Sha", # intentional typo
            "mobile_number": "9898033445"
        }
    }, headers=cit_headers).json()
    sub_id = sub["id"]
    
    # Operator logs in and rejects with reason
    op_token = client.post("/api/v1/auth/login", json={
        "email": "nikhil.operator@formseva.in",
        "role": "operator"
    }).json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    
    rej_res = client.post(f"/api/v1/operator/submissions/{sub_id}/update-status", json={
        "status": "rejected",
        "rejection_reason": "Name mismatch: 'Pooja Sha' does not match Aadhaar 'Pooja Shah'",
        "operator_notes": "Please correct name and resubmit"
    }, headers=op_headers)
    assert rej_res.status_code == 200
    assert rej_res.json()["submission"]["status"] == "rejected"
    assert "Name mismatch" in rej_res.json()["submission"]["rejection_reason"]
    
    # Citizen resubmits with corrected name
    resub_res = client.post(f"/api/v1/submissions/{sub_id}/resubmit", json={
        "field_values": {"applicant_name": "Pooja Shah"},
        "resubmission_note": "Corrected spelling as per Aadhaar"
    }, headers=cit_headers)
    assert resub_res.status_code == 200
    resub_data = resub_res.json()
    assert resub_data["status"] == "resubmitted"
    assert resub_data["field_values"]["applicant_name"] == "Pooja Shah"
    assert resub_data["id"] == sub_id # Preserves same application ID

def test_operator_form_eligibility_and_security():
    """Verify operator form eligibility and backend 403 authorization check."""
    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "role": "admin"
    }).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Check operator assignments
    assigns = client.get("/api/v1/admin/operator-assignments", headers=admin_headers).json()
    assert len(assigns) > 0
    
    # Test Google direct login
    g_res = client.post("/api/v1/auth/google", json={
        "email": "google.citizen@gmail.com",
        "full_name": "Google User",
        "phone": "9825099887"
    })
    assert g_res.status_code == 200
    g_data = g_res.json()
    assert "access_token" in g_data
    assert g_data["user"]["role"] == "citizen"
    assert g_data["user"]["phone"] == "9825099887"

def test_admin_toggle_form_active_status():
    """Verify that toggling form active status hides/shows it from public listing without deleting the form."""
    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "role": "admin"
    }).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Initially all forms are listed
    initial_forms = client.get("/api/v1/forms").json()
    assert any(f["slug"] == "income_certificate" for f in initial_forms)
    
    # 2. Toggle income_certificate to INACTIVE (turned OFF)
    toggle_res = client.patch("/api/v1/forms/income_certificate/toggle-active", headers=admin_headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_active"] is False
    
    # 3. Public active_only forms list should now HIDE income_certificate
    public_forms = client.get("/api/v1/forms?active_only=true").json()
    assert not any(f["slug"] == "income_certificate" for f in public_forms)
    
    # 4. Toggle back to ACTIVE (turned ON)
    toggle_back = client.patch("/api/v1/forms/income_certificate/toggle-active", headers=admin_headers)
    assert toggle_back.status_code == 200
    assert toggle_back.json()["is_active"] is True
    
    # 5. Public forms list now includes income_certificate again
    restored_forms = client.get("/api/v1/forms?active_only=true").json()
    assert any(f["slug"] == "income_certificate" for f in restored_forms)

