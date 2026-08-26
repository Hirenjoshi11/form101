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
        "password": "Admin@FormSeva2026!",
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
        "password": "Operator@123!",
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
        "password": "Admin@FormSeva2026!",
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
    
    # 3. Verify Operator views unassigned submission -> masked phone (FS-H6)
    op_token = client.post("/api/v1/auth/login", json={
        "email": "vicky.operator@formseva.in",
        "password": "Operator@123!",
        "role": "operator"
    }).json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    
    op_detail_unassigned = client.get(f"/api/v1/submissions/{dl_sub['id']}", headers=op_headers).json()
    assert op_detail_unassigned["service_fee"] == 1000.00
    assert op_detail_unassigned["total_fee"] == 1150.00
    assert "XXXXXX1223" in op_detail_unassigned["user_phone"]
    
    # 4. Operator starts filing -> full phone is unmasked for processing
    client.post(f"/api/v1/operator/submissions/{dl_sub['id']}/start", headers=op_headers)
    op_detail_assigned = client.get(f"/api/v1/submissions/{dl_sub['id']}", headers=op_headers).json()
    assert op_detail_assigned["user_phone"] == "9898011223"

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
        "password": "Operator@123!",
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
        "password": "Admin@FormSeva2026!",
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
        "password": "Admin@FormSeva2026!",
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

def test_phase1_security_auth_hardening():
    """Verify Phase 1 Security Fixes: FS-C1, FS-C2, FS-H5, FS-C3."""
    
    # 1. Staff requires password credential (FS-C1)
    admin_bad_pw = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "password": "WrongPassword123!"
    })
    assert admin_bad_pw.status_code == 401
    
    admin_good_pw = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "password": "Admin@FormSeva2026!"
    })
    assert admin_good_pw.status_code == 200
    assert admin_good_pw.json()["user"]["role"] == "admin"
    admin_token = admin_good_pw.json()["access_token"]
    
    # 2. Client-supplied role tampering resistance (FS-C1)
    # An unauthorized citizen attempting to claim role='admin' must still be assigned role='citizen'
    attacker_login = client.post("/api/v1/auth/login", json={
        "email": "attacker@gmail.com",
        "role": "admin"  # Client claims admin
    })
    assert attacker_login.status_code == 200
    assert attacker_login.json()["user"]["role"] == "citizen" # Server forces citizen
    
    # 3. Server-side session revocation & logout (FS-H5)
    test_cit = client.post("/api/v1/auth/login", json={
        "email": "logout.test@example.com",
        "full_name": "Logout Tester"
    }).json()
    cit_token = test_cit["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}
    
    # Profile accessible before logout
    me_res = client.get("/api/v1/auth/me", headers=cit_headers)
    assert me_res.status_code == 200
    
    # Logout revokes JTI on server
    logout_res = client.post("/api/v1/auth/logout", headers=cit_headers)
    assert logout_res.status_code == 200
    
    # Subsequent access with same token is rejected (401 Revoked)
    post_logout_me = client.get("/api/v1/auth/me", headers=cit_headers)
    assert post_logout_me.status_code == 401
    assert "revoked" in post_logout_me.json()["detail"].lower()

def test_phase2_unified_authorization_and_access_control():
    """Verify Phase 2 Access Control: FS-H1, FS-H3, FS-H6."""
    # 1. Setup Citizen A and Citizen B
    cit_a_token = client.post("/api/v1/auth/login", json={"email": "citizen.alice@test.in", "full_name": "Alice Patel"}).json()["access_token"]
    cit_b_token = client.post("/api/v1/auth/login", json={"email": "citizen.bob@test.in", "full_name": "Bob Shah"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {cit_a_token}"}
    headers_b = {"Authorization": f"Bearer {cit_b_token}"}
    
    # Citizen A creates application with Aadhaar and Phone
    sub_a = client.post("/api/v1/submissions", json={
        "form_slug": "income_certificate",
        "field_values": {
            "applicant_name": "Alice Patel",
            "mobile_number": "9825012345",
            "aadhaar_number": "123456789012"
        }
    }, headers=headers_a).json()
    sub_a_id = sub_a["id"]
    
    # 2. Citizen B attempts to view Citizen A's application -> 403 Forbidden
    cross_tenant_view = client.get(f"/api/v1/submissions/{sub_a_id}", headers=headers_b)
    assert cross_tenant_view.status_code == 403
    
    # 3. Citizen B attempts to submit OTP for Citizen A's application -> 403 Forbidden
    cross_tenant_otp = client.post("/api/v1/otp/submit", json={
        "submission_id": sub_a_id,
        "otp_code": "123456"
    }, headers=headers_b)
    assert cross_tenant_otp.status_code in (403, 404)
    
    # 4. Operator Vicky logs in (assigned to Ahmedabad / Income Certificate)
    vicky_token = client.post("/api/v1/auth/login", json={
        "email": "vicky.operator@formseva.in",
        "password": "Operator@123!"
    }).json()["access_token"]
    vicky_headers = {"Authorization": f"Bearer {vicky_token}"}
    
    # 5. Operator Nikhil logs in
    nikhil_token = client.post("/api/v1/auth/login", json={
        "email": "nikhil.operator@formseva.in",
        "password": "Operator@123!"
    }).json()["access_token"]
    nikhil_headers = {"Authorization": f"Bearer {nikhil_token}"}
    
    # Vicky starts filing -> becomes assigned operator
    vicky_start = client.post(f"/api/v1/operator/submissions/{sub_a_id}/start", headers=vicky_headers)
    assert vicky_start.status_code == 200
    
    # 6. Unassigned Operator Nikhil attempts to update status on Vicky's submission -> 403 Forbidden (FS-H1)
    nikhil_hijack = client.post(f"/api/v1/operator/submissions/{sub_a_id}/update-status", json={
        "status": "approved"
    }, headers=nikhil_headers)
    assert nikhil_hijack.status_code == 403
    assert "not the assigned operator" in nikhil_hijack.json()["detail"].lower()
    
    # 7. Unassigned Operator Nikhil attempts to trigger OTP on Vicky's submission -> 403 Forbidden (FS-H3)
    nikhil_otp = client.post("/api/v1/otp/trigger", json={
        "submission_id": sub_a_id,
        "otp_purpose_en": "Malicious OTP Prompt"
    }, headers=nikhil_headers)
    assert nikhil_otp.status_code == 403

def test_phase3_upload_security_and_magic_bytes():
    """Verify Phase 3 Upload Security & Magic Byte Validation: FS-H4."""
    # 1. Citizen creates submission
    cit_token = client.post("/api/v1/auth/login", json={"email": "uploader@test.in", "full_name": "File Uploader"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {cit_token}"}
    
    sub = client.post("/api/v1/submissions", json={
        "form_slug": "income_certificate",
        "field_values": {"applicant_name": "File Uploader"}
    }, headers=headers).json()
    sub_id = sub["id"]
    
    # 2. Upload fake PDF (disguised text file without %PDF magic bytes) -> 400 Bad Request
    fake_pdf = b"This is plain text trying to pose as a PDF document"
    res_fake = client.post(
        f"/api/v1/submissions/{sub_id}/upload-doc",
        data={"document_type_key": "income_proof"},
        files={"file": ("fake_doc.pdf", fake_pdf, "application/pdf")},
        headers=headers
    )
    assert res_fake.status_code == 400
    assert "magic byte" in res_fake.json()["detail"].lower()
    
    # 3. Upload genuine PDF with valid %PDF-1.4 header -> 200 OK
    genuine_pdf = b"%PDF-1.4\n%genuine pdf content for verification\n%%EOF"
    res_genuine = client.post(
        f"/api/v1/submissions/{sub_id}/upload-doc",
        data={"document_type_key": "income_proof"},
        files={"file": ("genuine_doc.pdf", genuine_pdf, "application/pdf")},
        headers=headers
    )
    assert res_genuine.status_code == 200
    doc_data = res_genuine.json()["document"]
    assert doc_data["mime_type"] == "application/pdf"
    assert "vault/" in doc_data["storage_path"]
    assert doc_data["storage_path"].startswith(f"vault/{sub_id}/")
    assert doc_data["storage_path"].endswith(".pdf")
    
    # 4. Upload genuine PNG with valid PNG magic bytes -> 200 OK
    genuine_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    res_png = client.post(
        f"/api/v1/submissions/{sub_id}/upload-doc",
        data={"document_type_key": "identity_proof"},
        files={"file": ("id_photo.png", genuine_png, "image/png")},
        headers=headers
    )
    assert res_png.status_code == 200
    assert res_png.json()["document"]["mime_type"] == "image/png"

def test_phase4_state_machine_and_lifecycle_transitions():
    """Verify Phase 4 Lifecycle State Machine (FS-H2, FS-L5)."""
    # 1. Citizen creates submission
    cit_token = client.post("/api/v1/auth/login", json={"email": "lifecycle@test.in", "full_name": "Lifecycle Citizen"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {cit_token}"}
    
    sub = client.post("/api/v1/submissions", json={
        "form_slug": "income_certificate",
        "field_values": {"applicant_name": "Lifecycle Citizen"}
    }, headers=headers).json()
    sub_id = sub["id"]
    
    op_token = client.post("/api/v1/auth/login", json={
        "email": "vicky.operator@formseva.in",
        "password": "Operator@123!"
    }).json()["access_token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    
    # 2. Operator attempts invalid jump: updating directly to 'approved' without starting -> 400 Bad Request
    invalid_jump = client.post(f"/api/v1/operator/submissions/{sub_id}/update-status", json={
        "status": "approved"
    }, headers=op_headers)
    assert invalid_jump.status_code in (400, 403)
    
    # 3. Valid transition: start filing -> operator_filling
    start_res = client.post(f"/api/v1/operator/submissions/{sub_id}/start", headers=op_headers)
    assert start_res.status_code == 200
    assert start_res.json()["submission"]["status"] == "operator_filling"
    
    # 4. Valid transition: operator_filling -> approved
    approve_res = client.post(f"/api/v1/operator/submissions/{sub_id}/update-status", json={
        "status": "approved",
        "certificate_url": "https://digitalgujarat.gov.in/certs/test.pdf"
    }, headers=op_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["submission"]["status"] == "approved"
    
    # 5. Invalid transition: approved is terminal, citizen cannot resubmit an approved certificate -> 400 Bad Request
    invalid_resubmit = client.post(f"/api/v1/submissions/{sub_id}/resubmit", json={
        "field_values": {"applicant_name": "Tampered Name"}
    }, headers=headers)
    assert invalid_resubmit.status_code == 400
    assert "cannot transition" in invalid_resubmit.json()["detail"].lower()
    
    # 6. Admin toggles operator active status (FS-L5)
    admin_token = client.post("/api/v1/auth/login", json={
        "email": "admin@formseva.gujarat.gov.in",
        "password": "Admin@FormSeva2026!"
    }).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Find operator id for Vicky
    vicky_id = next(op["id"] for op in client.get("/api/v1/admin/operators", headers=admin_headers).json() if op["email"] == "vicky.operator@formseva.in")
    toggle_op = client.patch(f"/api/v1/admin/operators/{vicky_id}/toggle-active", headers=admin_headers)
    assert toggle_op.status_code == 200
    assert toggle_op.json()["operator"]["is_active"] is False
    
    # Toggle back to active
    toggle_back = client.patch(f"/api/v1/admin/operators/{vicky_id}/toggle-active", headers=admin_headers)
    assert toggle_back.status_code == 200
    assert toggle_back.json()["operator"]["is_active"] is True

def test_phase5_operational_defense_in_depth():
    """Verify Phase 5 Defense-in-Depth (FS-M3, FS-M1, FS-L1)."""
    # 1. Security headers check on responses (FS-M3)
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.headers.get("X-Content-Type-Options") == "nosniff"
    assert health_res.headers.get("X-Frame-Options") == "DENY"
    assert health_res.headers.get("X-XSS-Protection") == "1; mode=block"
    assert health_res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    
    # 2. Rate limiter sliding-window test (FS-M1)
    from formseva_app.core.rate_limit import InMemoryRateLimiter
    from fastapi import Request
    from unittest.mock import MagicMock
    
    limiter = InMemoryRateLimiter(requests_limit=3, window_seconds=2)
    mock_req = MagicMock(spec=Request)
    mock_req.client.host = "192.168.1.50"
    mock_req.url.path = "/test/endpoint"
    
    # 3 allowed
    limiter(mock_req)
    limiter(mock_req)
    limiter(mock_req)
    
    # 4th triggers 429 Too Many Requests
    import pytest
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        limiter(mock_req)
    assert exc_info.value.status_code == 429
    
    # 3. Audit log structure validation (FS-L1)
    from formseva_app.core.audit import record_audit_log
    from formseva_app.core.database import db
    
    initial_len = len(db.audit_logs)
    record_audit_log(
        action="TEST_SECURITY_AUDIT",
        actor_id="admin-001",
        actor_role="admin",
        entity_type="system",
        entity_id="sys-1",
        old_state={"setting": False},
        new_state={"setting": True}
    )
    assert len(db.audit_logs) == initial_len + 1
    latest_log = db.audit_logs[-1]
    assert latest_log["action"] == "TEST_SECURITY_AUDIT"
    assert "client_ip" in latest_log
    assert "user_agent" in latest_log



