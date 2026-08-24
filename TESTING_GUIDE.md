# 🏛️ FormSeva Gujarat — Complete QA & Tester Playbook

> **Comprehensive Testing Guide & Feature Checklist**  
> **Platform Version**: 1.0.0 (Gujarat Government Certificate Assisted-Filing Platform)  
> **Base URLs**:
> - **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
> - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📑 Table of Contents
1. [🚀 Quick Start & Test Environment](#-quick-start--test-environment)
2. [👥 Test Accounts & Roles](#-test-accounts--roles)
3. [🔄 Key End-to-End User Journeys](#-key-end-to-end-user-journeys)
   - [Journey 1: Citizen Applies & Pays for Certificate](#journey-1-citizen-applies--pays-for-certificate)
   - [Journey 2: Operator Workbench & 1-Click Form Sync](#journey-2-operator-workbench--1-click-form-sync)
   - [Journey 3: In-App Assisted OTP Protocol](#journey-3-in-app-assisted-otp-protocol)
   - [Journey 4: Operator Certificate PDF Upload & Citizen Download](#journey-4-operator-certificate-pdf-upload--citizen-download)
   - [Journey 5: Admin Billing & Financial Analytics](#journey-5-admin-billing--financial-analytics)
   - [Journey 6: Citizen Feedback & Admin Review](#journey-6-citizen-feedback--admin-review)
4. [🧪 Page-by-Page Feature Verification Matrix](#-page-by-page-feature-verification-matrix)
5. [🌐 Multilingual Localization Testing (GU / HI / EN)](#-multilingual-localization-testing)
6. [🛡️ Security, Validation & DPDP Act Compliance Checklist](#-security-validation--dpdp-act-compliance-checklist)

---

## 🚀 Quick Start & Test Environment

### 1. Running the Local Servers
| Component | Command | Working Directory | Local URL |
| :--- | :--- | :--- | :--- |
| **Frontend** (Next.js) | `npm run dev` | `d:/Software/form1.1/frontend` | [http://localhost:3000](http://localhost:3000) |
| **Backend** (FastAPI) | `python main.py` | `d:/Software/form1.1/backend` | [http://localhost:8000](http://localhost:8000) |
| **API Docs** (Swagger) | Auto-served by FastAPI | Backend root | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 👥 Test Accounts & Roles

The system supports 1-click role switching on the Login page ([/login](http://localhost:3000/login)) or top navigation:

| Role | Email | Display Name | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@formseva.in` | Rameshbhai Prajapati | Apply for certificates, upload identity docs, pay fees, track status, submit OTP, download certificates/receipts |
| **Operator** | `operator@formseva.in` | Bhavik Patel (Ahmedabad) | View assigned queue, 1-click copy form fields, request OTP from citizens, upload official PDF certificates, change filing statuses |
| **Admin** | `admin@formseva.in` | State Admin Officer | Full analytics, real-time revenue ledger, operator CRUD, service catalog/rates CRUD, citizen feedback review, audit logs |

---

## 🔄 Key End-to-End User Journeys

### Journey 1: Citizen Applies & Pays for Certificate
1. Navigate to **Home** ([http://localhost:3000/](http://localhost:3000)) or **All Services** ([http://localhost:3000/forms](http://localhost:3000/forms)).
2. Select any service (e.g. **Income Certificate (આવકનું પ્રમાણપત્ર)** or **NEET UG Exam Registration**).
3. Verify the multi-step form wizard loads:
   - **Step 1: Personal Details**: Name, Father's Name, Gender, DOB, Mobile, Annual Income. *(Tip: Click "Pre-fill Demo Data" for instant testing)*.
   - **Step 2: Address / Location**: District (e.g. Ahmedabad), Taluka (Daskroi), Village, Pincode.
   - **Step 3: Service-Specific Questions**: Income purpose, Ration card number, Category.
   - **Step 4: Document Vault**: Upload mock PDF or image files for Aadhaar Card, Ration Card, etc. Verify drag-and-drop, file size display, and delete buttons.
   - **Step 5: Review & Payment**: Verify the fee breakdown (Official Govt Fee + ₹99 Service Fee).
4. Click **"Pay & Submit Application"** -> Select UPI / Card / NetBanking -> Click **"Pay Now"**.
5. **Expected Result**: Success confirmation appears showing the generated Application ID (e.g. `FS-2026-GJ-9812`). User is redirected to **My Forms / Track Page** ([/track](http://localhost:3000/track)).

---

### Journey 2: Operator Workbench & 1-Click Form Sync
1. Open the **Operator Workbench** ([http://localhost:3000/operator](http://localhost:3000/operator)).
2. In the top bar, switch between specialists (e.g., *Bhavik Patel - Ahmedabad*, *Hiral Shah - Vadodara*).
3. Select the citizen's application from the **Assigned Queue** on the left column.
4. **Test 1-Click Copy**:
   - Click the **"Copy"** button next to Applicant Name, Mobile, or any custom field.
   - Click **"Copy All Details"** in the upper right.
   - Paste into Notepad to verify the entire form payload is cleanly formatted for pasting into Digital Gujarat or NTA portals.
5. Click **"1. Start Filing"** -> Notice the status updates to `operator_filling` and a citizen notification is dispatched.

---

### Journey 3: In-App Assisted OTP Protocol
1. On the **Operator Workbench** ([/operator](http://localhost:3000/operator)):
   - Inside the selected application, click **"Request Citizen OTP"**.
   - Customize the purpose (e.g., *"Digital Gujarat Portal Login OTP"*).
   - Click **"Send OTP Request"**.
2. Open the **Citizen Track Page** ([/track](http://localhost:3000/track)) in another tab/window:
   - Observe the live status pill changes to `Awaiting OTP` (Orange).
   - The citizen sees an active OTP notification with the purpose and input field.
   - Citizen enters a 6-digit test code (e.g., `482910`) and clicks **"Submit OTP"**.
3. Return to **Operator Workbench**:
   - Operator instantly sees `OTP Received: 482910` with timestamp.
   - Operator clicks **"Copy OTP"** to paste into the government portal.

---

### Journey 4: Operator Certificate PDF Upload & Citizen Download
1. On **Operator Workbench** ([/operator](http://localhost:3000/operator)):
   - Enter a mock Government Portal Application Number (e.g. `DG-REV-2026-99210`).
   - Enter Operator Notes (e.g. `Approved by Mamlatdar e-sign`).
   - In the **"Upload Approved Certificate / Receipt (PDF)"** box, attach any test `.pdf` file.
   - Click **"3. Mark Approved & Done"**.
2. Go to the **Citizen Track Page** ([/track](http://localhost:3000/track)):
   - Find the approved application card.
   - **Verification**: Notice the card has a single, clean **"Download"** button on the middle of the right-hand side. (No redundant view/preview buttons).
   - Click **"Download"** -> Verify the uploaded PDF certificate downloads directly to your device with the correct filename.

---

### Journey 5: Admin Billing & Financial Analytics
1. Open the **Admin Console** ([http://localhost:3000/admin](http://localhost:3000/admin)).
2. Click the **"બિલિંગ & આવક (Billing)"** tab.
3. **Verify Chart Structure & Alignment**:
   - **Y-Axis & Guidelines**: Check the left Y-axis labels (e.g., `₹80k`, `₹60k`, `₹40k`, `₹20k`, `₹0`) and horizontal dashed gridlines.
   - **Stacked Bar Segments**: Verify Govt Fee (Amber) is anchored at the bottom and Portal Margin (Emerald) is stacked on top.
   - **X-Axis Date Labels**: Verify dates (`01 Aug`, `03 Aug`, `05 Aug`, etc.) are evenly spaced without any truncation (`...`) or overlap.
   - **Interactive Hover**: Hover over any bar to inspect the floating dark tooltip showing date, gross collection, portal fee, govt fee, and transaction count.
   - **Daily / Monthly Toggle**: Toggle between **Daily** and **Monthly** views to verify both charts render properly.
4. **Test Date Filter Presets**:
   - Select *Today*, *This Week*, *This Month*, *Last Month*, *Year 2026*, or *Custom Date Range*.
   - Verify KPI cards, charts, and transaction ledger re-aggregate dynamically.
5. **Test CSV Export**:
   - Click **"Export CSV"** in the top action bar.
   - Verify `FormSeva_Billing_Report_....csv` downloads with complete line-item data.

---

### Journey 6: Citizen Feedback & Admin Review
1. Navigate to **Citizen Feedback Page** ([http://localhost:3000/feedback](http://localhost:3000/feedback)).
2. Fill out feedback:
   - Select Star Rating (1 to 5 stars).
   - Select Feedback Category (e.g., *Service Experience*, *Payment Issue*).
   - Enter name, mobile, and detailed feedback comment.
   - Click **"Submit Citizen Feedback"**.
3. Open **Admin Portal** -> **"પ્રતિસાદ (Feedback)"** tab:
   - Verify the newly submitted feedback appears at the top.
   - Filter by rating (e.g. 5 Stars, 1-2 Stars) or status (`NEW`, `REVIEWED`, `RESOLVED`).
   - Add an Internal Admin Resolution Note and click **"Save Resolution Note"**.

---

## 🧪 Page-by-Page Feature Verification Matrix

| Page URL | Key Features to Test | Expected Behavior |
| :--- | :--- | :--- |
| **`/`** (Home) | Language Switcher, Hero search bar, Service Cards, Myth Busters accordion, SLA badges | Search filters services instantly; language switches all text without reload; Myth Busters expand/collapse |
| **`/forms`** | Category filters (Revenue, Social Welfare, Transport, Education), Search | Instant filtering of government services with fee breakdown |
| **`/forms/[slug]`** | 5-Step Wizard, Demo pre-fill, Document uploader, Live fee calculator, Payment checkout | Validates required fields per step; uploads files up to 5MB; mock checkout creates application ID |
| **`/track`** | Search by App ID, Status tabs, Filing Receipt download, Simple right-side Certificate Download button | Correct status pills; Download button triggers direct download of operator-uploaded/generated PDF |
| **`/operator`** | Queue switcher, 1-Click field copy, Copy All Details, Trigger OTP modal, Upload PDF Certificate, Status actions | Copies to clipboard with toast; triggers live OTP to citizen; attaches PDF to application |
| **`/admin`** | **Tab 1: Overview**: Operational KPIs & Live Queue<br>**Tab 2: Billing**: Stacked bar chart, Y-axis grid, transaction ledger, CSV export<br>**Tab 3: Queue**: Reassign operator, filter status<br>**Tab 4: Operators**: Add/edit operator, toggle active<br>**Tab 5: Services**: Add/edit form fees & SLA<br>**Tab 6: Feedback**: Review ratings & admin notes<br>**Tab 7: Audit Logs**: Immutable chronological logs | All 7 tabs render real-time database state; forms/operators/rates edits immediately sync across app |
| **`/feedback`** | Rating stars, Service selector, Validation, Success confirmation | Submits feedback and updates admin feedback dashboard in real-time |
| **`/rates`** | Tariff table comparing official govt fees vs FormSeva assisted filing fee | Responsive fee breakdown with SLA turnaround timelines |
| **`/about`** | Mission, Gujarat digital governance overview, Security framework | Clean, responsive informational layout |
| **`/help`** | FAQs, helpline numbers, grievance redressal procedure | Interactive accordion FAQs |
| **`/login`** | Role switcher (Citizen, Operator, Admin), demo login buttons | 1-click login stores JWT token and user profile in localStorage |

---

## 🌐 Multilingual Localization Testing

FormSeva features complete, zero-fallback localization across all 3 official languages:
- **ગુજરાતી (Gujarati)** — Default official state language
- **हिन्दी (Hindi)** — National language
- **English** — Global standard

### How to Test:
1. Click the Language Switcher pill in the top navigation on any page.
2. Verify:
   - Form field labels, placeholders, and error messages translate instantly.
   - Status pills (*ડ્રાફ્ટ, સરકારી પોર્ટલ પર ફાઇલ થયેલ, મંજૂર / તૈયાર PDF*) translate accurately.
   - Downloaded PDF certificates reflect the chosen language.

---

## 🛡️ Security, Validation & DPDP Act Compliance Checklist

- [x] **DPDP Act 2023 Compliance**: Citizen uploaded identity proofs (Aadhaar, Ration Card) are scoped per application vault.
- [x] **JWT Authentication**: Secured operator and admin routes with role-based access control (RBAC).
- [x] **Tamper-Evident Audit Trail**: Every status modification, operator assignment, and financial action records timestamp and actor ID in `/admin` -> Audit Logs.
- [x] **Client-Side Form Validation**: Mobile number (10 digits), Aadhaar (12 digits), Pincode (6 digits), and mandatory file upload checks.
- [x] **Graceful Offline / LocalStorage Fallback**: All core workflows (submitting forms, filing, OTP, PDF download, analytics) function with full data persistence.

---

*FormSeva Gujarat — Certified Government Certificate Assisted-Filing System*
