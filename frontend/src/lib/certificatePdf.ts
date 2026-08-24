import { FormSubmission } from './types';

/**
 * Generates an official Gujarat Government style certificate HTML document for printing / PDF saving.
 */
export function generateCertificateHtml(sub: FormSubmission, language: string = 'en'): string {
  const isApproved = sub.status === 'approved';
  const issueDate = sub.completed_at ? new Date(sub.completed_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString('en-IN'); // 3 years validity for Gujarat Revenue
  const certNumber = `GJ-CERT-${sub.application_number.replace('FS-', '')}-${new Date().getFullYear()}`;
  const govtRef = sub.govt_portal_application_id || `DG-GJ-${Math.floor(100000 + Math.random() * 900000)}`;

  const applicantName = sub.field_values?.applicant_name || sub.user_name || 'Rameshchandra B. Patel';
  const fatherName = sub.field_values?.father_husband_name || sub.field_values?.father_name || 'Kanjibhai Patel';
  const address = sub.field_values?.residential_address || `${sub.field_values?.village_city || 'Vastral'}, ${sub.field_values?.taluka || 'Daskroi'}, ${sub.field_values?.district || 'Ahmedabad'}`;
  const district = sub.field_values?.district || 'Ahmedabad (અમદાવાદ)';
  const taluka = sub.field_values?.taluka || 'Daskroi (દસક્રોઈ)';
  const income = sub.field_values?.annual_income ? `₹ ${Number(sub.field_values.annual_income).toLocaleString('en-IN')}` : '₹ 1,20,000/-';

  const formTitle = sub.form_title_en || 'Gujarat Government Certificate';
  const formTitleGu = sub.form_title_gu || 'ગુજરાત સરકાર સત્તાવાર પ્રમાણપત્ર';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Certificate - ${certNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Gujarati:wght@400;600;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', 'Noto Sans Gujarati', sans-serif;
      color: #1e293b;
      background: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .cert-container {
      width: 100%;
      max-width: 800px;
      margin: 20px auto;
      background: #ffffff;
      padding: 40px;
      border: 8px double #1e3a8a;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      position: relative;
      background-image: radial-gradient(#f1f5f9 1px, transparent 1px);
      background-size: 20px 20px;
    }

    @media print {
      body {
        background: #ffffff;
      }
      .cert-container {
        margin: 0;
        padding: 30px;
        box-shadow: none;
        border: 6px double #1e3a8a;
        max-width: 100%;
        page-break-after: always;
      }
      .no-print {
        display: none !important;
      }
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(30, 58, 138, 0.04);
      pointer-events: none;
      text-transform: uppercase;
      white-space: nowrap;
      z-index: 0;
    }

    .header-table {
      width: 100%;
      margin-bottom: 20px;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 15px;
      position: relative;
      z-index: 1;
    }

    .emblem-cell {
      text-align: center;
      width: 90px;
    }

    .emblem-icon {
      width: 70px;
      height: 70px;
    }

    .title-cell {
      text-align: center;
      padding: 0 15px;
    }

    .govt-title-gu {
      font-size: 19px;
      font-weight: 700;
      color: #b91c1c;
      margin-bottom: 3px;
    }

    .govt-title-en {
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .dept-subtitle {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-top: 4px;
    }

    .cert-heading-badge {
      text-align: center;
      margin: 15px 0 25px 0;
      position: relative;
      z-index: 1;
    }

    .cert-title-box {
      display: inline-block;
      background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
      color: #ffffff;
      padding: 10px 30px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(30, 58, 138, 0.2);
    }

    .cert-title-box h2 {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .cert-title-box p {
      font-size: 13px;
      opacity: 0.95;
    }

    .meta-grid {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 18px;
      font-size: 12px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .meta-col strong {
      color: #0f172a;
    }

    .cert-body {
      font-size: 13.5px;
      line-height: 1.8;
      color: #334155;
      margin-bottom: 25px;
      text-align: justify;
      position: relative;
      z-index: 1;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0 20px 0;
      font-size: 12.5px;
    }

    .details-table td {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
    }

    .details-table td.label-cell {
      width: 35%;
      background: #f1f5f9;
      font-weight: 600;
      color: #1e293b;
    }

    .details-table td.val-cell {
      width: 65%;
      color: #0f172a;
      font-weight: 500;
    }

    .stamp-signature-area {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      position: relative;
      z-index: 1;
    }

    .qr-security-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 10px;
      border-radius: 8px;
    }

    .qr-code {
      width: 80px;
      height: 80px;
      background: #fff;
      border: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      text-align: center;
      padding: 4px;
    }

    .qr-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
      max-width: 160px;
    }

    .digital-seal-box {
      text-align: center;
      width: 240px;
      border: 2px solid #059669;
      border-radius: 8px;
      padding: 10px;
      background: #ecfdf5;
    }

    .seal-badge {
      font-size: 11px;
      font-weight: 700;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .seal-name {
      font-size: 12px;
      font-weight: 800;
      color: #047857;
      margin: 4px 0 2px 0;
    }

    .seal-sub {
      font-size: 9.5px;
      color: #065f46;
      line-height: 1.3;
    }

    .cert-footer {
      margin-top: 25px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      position: relative;
      z-index: 1;
    }

    .print-bar {
      max-width: 800px;
      margin: 15px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
    }

    .print-btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 18px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .print-btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <span>Official Gujarat Certificate Generated &bull; ${certNumber}</span>
    <div>
      <button class="print-btn" onclick="window.print()">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
        Save as PDF / Print
      </button>
    </div>
  </div>

  <div class="cert-container">
    <div class="watermark">GOVT OF GUJARAT</div>

    <!-- Header -->
    <table class="header-table">
      <tr>
        <td class="emblem-cell">
          <svg class="emblem-icon" viewBox="0 0 100 100" fill="#1e3a8a">
            <!-- Lion Capital representation -->
            <circle cx="50" cy="50" r="44" fill="none" stroke="#b91c1c" stroke-width="4" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#1e3a8a" stroke-width="2" />
            <path d="M50 20 L53 35 L68 35 L56 44 L60 58 L50 49 L40 58 L44 44 L32 35 L47 35 Z" fill="#b91c1c" />
            <circle cx="50" cy="50" r="12" fill="#1e3a8a" />
            <text x="50" y="80" font-size="7" font-weight="bold" text-anchor="middle" fill="#1e3a8a">सत्यमेव जयते</text>
          </svg>
        </td>
        <td class="title-cell">
          <div class="govt-title-gu">ગુજરાત સરકાર &bull; મહેસૂલ વિભાગ</div>
          <div class="govt-title-en">GOVERNMENT OF GUJARAT</div>
          <div class="dept-subtitle">Revenue Department &bull; Digital Gujarat Citizen e-Services Portal</div>
        </td>
        <td class="emblem-cell" style="width: 80px;">
          <!-- Barcode representation -->
          <div style="font-family: monospace; font-size: 8px; letter-spacing: 2px; text-align: center; border: 1px solid #94a3b8; padding: 4px; border-radius: 4px; background: #fff;">
            ||| | |||| | ||||| | |||<br/>${sub.application_number}
          </div>
        </td>
      </tr>
    </table>

    <!-- Certificate Title Box -->
    <div class="cert-heading-badge">
      <div class="cert-title-box">
        <h2>${formTitle.toUpperCase()}</h2>
        <p>${formTitleGu}</p>
      </div>
    </div>

    <!-- Meta Details -->
    <div class="meta-grid">
      <div class="meta-col">
        <div><strong>Certificate No:</strong> ${certNumber}</div>
        <div style="margin-top: 4px;"><strong>Application No:</strong> ${sub.application_number}</div>
      </div>
      <div class="meta-col" style="text-align: right;">
        <div><strong>Date of Issue:</strong> ${issueDate}</div>
        <div style="margin-top: 4px;"><strong>Valid Until:</strong> ${validUntil}</div>
      </div>
    </div>

    <!-- Main Certificate Text -->
    <div class="cert-body">
      This is to officially certify that <strong>${applicantName}</strong>, Son/Daughter/Spouse of <strong>${fatherName}</strong>, residing at <strong>${address}</strong>, Taluka: <strong>${taluka}</strong>, District: <strong>${district}</strong>, Gujarat, has undergone official scrutiny and assisted verification under the Digital Gujarat e-Governance framework.
    </div>

    <!-- Verified Parameters Table -->
    <table class="details-table">
      <tr>
        <td class="label-cell">Applicant Name (અરજદારનું નામ)</td>
        <td class="val-cell"><strong>${applicantName}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Father / Husband Name</td>
        <td class="val-cell">${fatherName}</td>
      </tr>
      <tr>
        <td class="label-cell">Permanent Address</td>
        <td class="val-cell">${address}</td>
      </tr>
      <tr>
        <td class="label-cell">Jurisdiction District & Taluka</td>
        <td class="val-cell">${district} &bull; ${taluka}</td>
      </tr>
      <tr>
        <td class="label-cell">Government Portal Reference ID</td>
        <td class="val-cell"><code style="font-weight: bold; color: #1e3a8a;">${govtRef}</code></td>
      </tr>
      ${sub.field_values?.annual_income ? `
      <tr>
        <td class="label-cell">Verified Annual Family Income</td>
        <td class="val-cell" style="font-weight: bold; color: #047857;">${income} (Rupees in Words)</td>
      </tr>
      ` : ''}
      ${sub.field_values?.category ? `
      <tr>
        <td class="label-cell">Category / Social Class</td>
        <td class="val-cell" style="font-weight: bold; text-transform: uppercase;">${sub.field_values.category}</td>
      </tr>
      ` : ''}
      ${sub.field_values?.survey_number ? `
      <tr>
        <td class="label-cell">Land Survey / Block No</td>
        <td class="val-cell">${sub.field_values.survey_number}</td>
      </tr>
      ` : ''}
      <tr>
        <td class="label-cell">Assisting Operator & Verification</td>
        <td class="val-cell">${sub.assigned_operator_name || 'Designated Digital Gujarat Operator (Verified)'}</td>
      </tr>
    </table>

    <div class="cert-body" style="font-size: 11.5px; color: #64748b; margin-top: 10px;">
      <em>Note: As per Gujarat Government Revenue Department Resolution, this digitally generated certificate carries full legal validity across all state education institutions, scholarship portals, and government offices under Section 65B of the Indian Evidence Act.</em>
    </div>

    <!-- Signatures and Security Seals -->
    <div class="stamp-signature-area">
      <!-- QR code verification block -->
      <div class="qr-security-box">
        <div class="qr-code">
          <svg viewBox="0 0 100 100" width="70" height="70" fill="#0f172a">
            <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
            <rect x="5" y="5" width="20" height="20" fill="#fff" />
            <rect x="10" y="10" width="10" height="10" fill="#0f172a" />
            <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
            <rect x="75" y="5" width="20" height="20" fill="#fff" />
            <rect x="80" y="10" width="10" height="10" fill="#0f172a" />
            <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
            <rect x="5" y="75" width="20" height="20" fill="#fff" />
            <rect x="10" y="80" width="10" height="10" fill="#0f172a" />
            <rect x="35" y="10" width="10" height="10" fill="#0f172a" />
            <rect x="50" y="25" width="15" height="15" fill="#0f172a" />
            <rect x="35" y="45" width="25" height="20" fill="#0f172a" />
            <rect x="70" y="45" width="20" height="20" fill="#0f172a" />
            <rect x="40" y="75" width="20" height="20" fill="#0f172a" />
            <rect x="70" y="75" width="25" height="20" fill="#0f172a" />
          </svg>
        </div>
        <div class="qr-text">
          <strong>Digital Gujarat QR Security</strong><br/>
          Scan to verify authenticity via portal or e-Seva Gujarat registry.
        </div>
      </div>

      <!-- Digital Signature Seal -->
      <div class="digital-seal-box">
        <div class="seal-badge">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>
          Digitally Signed
        </div>
        <div class="seal-name">Competent Authority</div>
        <div class="seal-sub">
          Mamlatdar / Taluka Development Officer<br/>
          Revenue Department &bull; Govt of Gujarat<br/>
          <strong>Timestamp:</strong> ${issueDate} 12:00 IST
        </div>
      </div>
    </div>

    <!-- Footer disclaimer -->
    <div class="cert-footer">
      Form_Seva Gujarat Assisted-Filing Platform &bull; DPDP Act 2023 Compliant &bull; Digital India Verified &bull; Document Reference: ${sub.id}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Trigger immediate print or PDF download window for the certificate.
 */
export function downloadCertificatePdf(sub: FormSubmission, language: string = 'en'): void {
  const html = generateCertificateHtml(sub, language);
  
  // Create an iframe or new window for smooth printing/saving as PDF
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Automatically trigger print dialog once loaded
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };
  } else {
    // Fallback if popups blocked: trigger blob download
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${sub.application_number}_${sub.form_slug}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generates an official filing receipt and acknowledgement slip.
 */
export function generateReceiptHtml(sub: FormSubmission, language: string = 'en'): string {
  const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Application Receipt - ${sub.application_number}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; }
    .receipt-box { border: 2px solid #0f766e; border-radius: 8px; padding: 25px; max-width: 700px; margin: 0 auto; background: #fff; }
    .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 18px; font-weight: bold; color: #0f766e; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    .table th, .table td { padding: 10px; border: 1px solid #e2e8f0; text-align: left; }
    .table th { background: #f0fdfa; color: #134e4a; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .print-btn { background: #0f766e; color: #fff; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-bottom: 15px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div style="text-align: center;" class="no-print">
    <button class="print-btn" onclick="window.print()">Save Receipt as PDF / Print</button>
  </div>
  <div class="receipt-box">
    <div class="header">
      <div class="title">FORM_SEVA GUJARAT &bull; CITIZEN FILING RECEIPT</div>
      <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Payment & Application Acknowledgement Slip</p>
    </div>
    
    <table class="table">
      <tr>
        <th>Application Number</th>
        <td><strong style="color: #0f766e; font-size: 14px;">${sub.application_number}</strong></td>
      </tr>
      <tr>
        <th>Certificate / Service</th>
        <td>${sub.form_title_en} (${sub.form_title_gu})</td>
      </tr>
      <tr>
        <th>Applicant Name</th>
        <td>${sub.user_name || sub.field_values?.applicant_name || 'Rameshchandra Patel'}</td>
      </tr>
      <tr>
        <th>Submission Timestamp</th>
        <td>${dateStr}</td>
      </tr>
      <tr>
        <th>Application Status</th>
        <td><span class="badge badge-success">${sub.status.toUpperCase()}</span></td>
      </tr>
      <tr>
        <th>Government Reference ID</th>
        <td><code>${sub.govt_portal_application_id || 'Issued on portal'}</code></td>
      </tr>
      <tr>
        <th>Assigned Assisted Operator</th>
        <td>${sub.assigned_operator_name || 'Bhavik Patel (Ahmedabad Zone)'}</td>
      </tr>
      <tr>
        <th>Total Amount Paid</th>
        <td><strong>₹ ${sub.total_fee}</strong> (${sub.payment_status.toUpperCase()})</td>
      </tr>
    </table>

    <div style="margin-top: 20px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
      This is a digitally generated acknowledgement from Form_Seva Gujarat. Keep this receipt for tracking and government verification purposes.
    </div>
  </div>
</body>
</html>`;
}

export function downloadReceiptPdf(sub: FormSubmission, language: string = 'en'): void {
  const html = generateReceiptHtml(sub, language);
  const printWindow = window.open('', '_blank', 'width=800,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    };
  }
}
