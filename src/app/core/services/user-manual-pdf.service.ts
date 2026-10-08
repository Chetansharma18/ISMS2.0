import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserManualPdfService {

  private getBase64FromImage(img: HTMLImageElement): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 120;
      canvas.height = img.naturalHeight || img.height || 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
      }
    } catch {
      // ignore canvas errors
    }
    return '';
  }

  private async loadLogoImage(src: string): Promise<string> {
    try {
      const existing = document.querySelector<HTMLImageElement>(`img[src="${src}"]`);
      if (existing && existing.complete && existing.naturalWidth > 0) {
        const dataUrl = this.getBase64FromImage(existing);
        if (dataUrl) return dataUrl;
      }

      return await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const dataUrl = this.getBase64FromImage(img);
            resolve(dataUrl);
          } catch {
            resolve('');
          }
        };
        img.onerror = () => resolve('');
        img.src = src;
      });
    } catch {
      return '';
    }
  }

  /**
   * Generates and downloads the official ISMS 2.0 User Manual PDF
   * Explaining complete software architecture, step-by-step workflows, and operations.
   */
  async generateUserManualPdf(): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const [emblemBase64, rsldcBase64] = await Promise.all([
      this.loadLogoImage('/Rajasthan-Sarkar.png'),
      this.loadLogoImage('/rsldc-logo.png')
    ]);

    const totalPages = 4;
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const renderHeader = (pageNum: number) => {
      // Outer framing border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

      // Top banner bar
      doc.setFillColor(11, 53, 88); // #0B3558 Deep Navy
      doc.rect(margin, margin, contentWidth, 24, 'F');

      // Logos on first page or slim on subsequent
      if (pageNum === 1) {
        if (emblemBase64) {
          try {
            doc.addImage(emblemBase64, 'PNG', margin + 3, margin + 2.5, 16, 19);
          } catch {
            // ignore
          }
        }
        if (rsldcBase64) {
          try {
            doc.addImage(rsldcBase64, 'PNG', pageWidth - margin - 19, margin + 3.5, 16, 16);
          } catch {
            // ignore
          }
        }
      }

      // Title Text in Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(255, 255, 255);
      doc.text('GOVERNMENT OF RAJASTHAN', pageWidth / 2, margin + 6, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11); // #F59E0B Amber
      doc.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', pageWidth / 2, margin + 11.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(226, 232, 240);
      doc.text('Integrated Scheme Management System (ISMS 2.0) | Official Software User Manual & Guide', pageWidth / 2, margin + 16.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225);
      doc.text('Department of Skill, Employment and Entrepreneurship | https://livelihoods.rajasthan.gov.in', pageWidth / 2, margin + 20.5, { align: 'center' });
    };

    const renderFooter = (pageNum: number) => {
      const footerY = pageHeight - margin - 6;

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, footerY - 2, pageWidth - margin - 4, footerY - 2);

      // Footer labels
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('ISMS 2.0 Official Manual (Doc Ref: RSLDC/ISMS-2.0/MANUAL/2026-V1)', margin + 4, footerY + 2);

      doc.setFont('helvetica', 'bold');
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY + 2, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.text('Helpline: 0141-2716091 | isms-support@rajasthan.gov.in', pageWidth - margin - 4, footerY + 2, { align: 'right' });
    };

    // Helper to draw section header pill
    const drawSectionHeader = (title: string, yPos: number): number => {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(11, 53, 88);
      doc.roundedRect(margin + 4, yPos, contentWidth - 8, 6.5, 1, 1, 'FD');

      // Amber indicator bar
      doc.setFillColor(245, 158, 11);
      doc.rect(margin + 4, yPos, 2.5, 6.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(11, 53, 88);
      doc.text(title, margin + 9, yPos + 4.5);

      return yPos + 9;
    };

    // Helper to draw a key-value or step box
    const drawStepBox = (stepNum: string, stepTitle: string, desc: string[], yPos: number, height: number): number => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin + 4, yPos, contentWidth - 8, height, 1, 1, 'FD');

      // Step badge
      doc.setFillColor(11, 53, 88);
      doc.roundedRect(margin + 6, yPos + 2, 14, 5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text(stepNum, margin + 13, yPos + 5.5, { align: 'center' });

      // Step title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(stepTitle, margin + 23, yPos + 5.5);

      // Bullet points
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      let textY = yPos + 10;
      for (const line of desc) {
        doc.setFillColor(245, 158, 11);
        doc.circle(margin + 8, textY - 1, 0.6, 'F');
        doc.text(line, margin + 11, textY);
        textY += 3.8;
      }

      return yPos + height + 2.5;
    };

    // =========================================================================
    // PAGE 1: SYSTEM OVERVIEW, ARCHITECTURE & USER ROLES
    // =========================================================================
    renderHeader(1);

    let y = margin + 28;

    // Title Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin + 4, y, contentWidth - 8, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 53, 88);
    doc.text('INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)', pageWidth / 2, y + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Comprehensive Operational & Technical User Manual for Training Partners, Officials & Applicants', pageWidth / 2, y + 10.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(180, 83, 9);
    doc.text('Publication Release: Ver 2.0 (Active 2026-27) | Government of Rajasthan Digital Portal', pageWidth / 2, y + 15, { align: 'center' });

    y += 22;

    // Section 1: Executive Overview
    y = drawSectionHeader('1. EXECUTIVE SUMMARY & SOFTWARE OBJECTIVES', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    const overviewLines = [
      'ISMS 2.0 is an enterprise e-Governance cloud software deployed by Rajasthan Skill and Livelihoods Development Corporation',
      '(RSLDC) to automate, digitize, and monitor state skill development schemes end-to-end. The platform provides a single-window',
      'transparent mechanism for Scheme Notification, One-Time Registration (OTR), Expression of Interest (EOI) bidding, Cyber Treasury',
      'e-GRAS fee integration, Scrutiny Desk assessment, Skill Development Centre (SDC) CCTV inspection, and candidate certification.'
    ];
    for (const l of overviewLines) {
      doc.text(l, margin + 6, y);
      y += 3.6;
    }
    y += 2;

    // Highlights Box
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin + 4, y, contentWidth - 8, 12, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(49, 46, 129);
    doc.text('KEY PORTAL PILLARS:', margin + 7, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(67, 56, 202);
    doc.text('• 100% Paperless EOI Bidding  • Real-time e-GRAS Challan Settlement  • Aadhaar-Linked OTR  • Geo-tagged CCTV Batches', margin + 7, y + 8.5);
    y += 16;

    // Section 2: User Roles
    y = drawSectionHeader('2. USER ROLES & ACCESS HIERARCHY', y);

    const roles = [
      {
        role: 'TRAINING PARTNER (TP / PIA)',
        badge: 'TP-ROLE',
        desc: [
          'Completes mandatory 4-step OTR Profile with PAN, GSTIN, and NGO Darpan verification.',
          'Browses active schemes/tenders, pays processing fee via e-GRAS, and submits EOI proposals.',
          'Manages accredited Skill Development Centres (SDCs), rosters candidates, and logs CCTV IP feeds.'
        ]
      },
      {
        role: 'DEPARTMENT SCRUTINY OFFICER',
        badge: 'DEPT-ADMIN',
        desc: [
          'Accesses secure Scrutiny Desk protected with 6-digit Time-based OTP verification.',
          'Performs multi-stage technical, financial, and eligibility scoring of submitted EOI applications.',
          'Generates official Sanction Orders, logs clarification remarks, or issues rejection notices.'
        ]
      },
      {
        role: 'STATE / SUPER ADMINISTRATOR',
        badge: 'SUPER-ADMIN',
        desc: [
          'Configures new skill development schemes, budget targets, and submission deadline dates.',
          'Administers Master Tables, Committee assignments, EMD security deposits, and MIS analytics.',
          'Oversees state-wide grievance redressal and audit log compliance.'
        ]
      }
    ];

    for (const r of roles) {
      y = drawStepBox(r.badge, r.role, r.desc, y, 19);
    }

    renderFooter(1);

    // =========================================================================
    // PAGE 2: OTR REGISTRATION & SCHEME BROWSING
    // =========================================================================
    doc.addPage();
    renderHeader(2);
    y = margin + 28;

    y = drawSectionHeader('3. MODULE 1: ONE-TIME REGISTRATION (OTR) WORKFLOW', y);

    const otrSteps = [
      {
        badge: 'STEP 1',
        title: 'Organization Master Information',
        desc: [
          'Select Entity Type: Private Limited, Trust, Society, LLP, or Proprietorship firm.',
          'Enter and auto-verify PAN, TAN, GSTIN, and central NGO Darpan ID.',
          'Provide registered headquarters address in Rajasthan or pan-India along with official email and phone.'
        ]
      },
      {
        badge: 'STEP 2',
        title: 'Officer In-Charge & Authorized Signatory',
        desc: [
          'Declare primary Officer In-Charge (CEO, Secretary, or Managing Director) with official designation.',
          'Authenticate authorized signatory via mobile/email OTP verification.',
          'Attach Board Resolution / Power of Attorney granting authority to represent the organization.'
        ]
      },
      {
        badge: 'STEP 3',
        title: 'Statutory Document Vault & Financials',
        desc: [
          'Upload Certificate of Incorporation, Memorandum of Association (MoA), and Articles of Association (AoA).',
          'Submit CA-certified Audited Balance Sheets for the last 3 financial years (FY 2022-23, 2023-24, 2024-25).',
          'Document vault automatically assigns statutory digital seals and tamper-proof verification markers.'
        ]
      },
      {
        badge: 'STEP 4',
        title: 'Bank Mandate, Legal Undertaking & OTR ID Generation',
        desc: [
          'Provide verified Corporate Bank Account details (Bank Name, Branch IFSC, Account Number) with cancelled cheque.',
          'Review the complete consolidated OTR preview and sign the statutory anti-debarment legal undertaking.',
          'System generates permanent Unique OTR ID (e.g., ISMS-OTR-2026-9812) with downloadable OTR Profile PDF.'
        ]
      }
    ];

    for (const s of otrSteps) {
      y = drawStepBox(s.badge, s.title, s.desc, y, 20);
    }

    y += 2;
    y = drawSectionHeader('4. MODULE 2: BROWSING & SELECTING ACTIVE SCHEMES', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    const tenderGuide = [
      '1. Navigate to Active Tenders (/tenders) from the main navigation menu.',
      '2. Real-Time Scheme Table strictly displays active, open schemes; closed or expired tenders are automatically filtered out.',
      '3. Search & Filter: Filter by Scheme Category (State Funded, Centrally Sponsored, Special Projects) or search by scheme title.',
      '4. Inspect Scheme Parameters: View Target Trainees, EMD Security Deposit amount, Processing Fee, and Closing Date.',
      '5. Actions: Click "View" to inspect the scheme RFP guidelines or click "Apply for EOI" to enter the proposal submission desk.'
    ];
    for (const tg of tenderGuide) {
      doc.text(tg, margin + 6, y);
      y += 4;
    }

    renderFooter(2);

    // =========================================================================
    // PAGE 3: EOI 6-STEP PROPOSAL WORKFLOW & SUBMISSION CONFIRMATION
    // =========================================================================
    doc.addPage();
    renderHeader(3);
    y = margin + 28;

    y = drawSectionHeader('5. MODULE 3: EXPRESSION OF INTEREST (EOI) 6-STEP SUBMISSION FLOW', y);

    const eoiSteps = [
      {
        badge: 'STEP 1',
        title: 'Pre-requisites & Tender Processing Fee Settlement',
        desc: [
          'Confirm scheme eligibility and pay non-refundable Processing Fee (₹ 2,000) via Cyber Treasury Rajasthan.',
          'System interfaces directly with e-GRAS under Revenue Head 0070-60-800-01-00.',
          'Instant challan generation with Treasury GRN (Government Reference Number).'
        ]
      },
      {
        badge: 'STEP 2',
        title: 'OTR Profile Snapshot & Training Center Mapping',
        desc: [
          'System automatically imports verified organization details, pan-card data, and signatory details from OTR.',
          'Select targeted districts and training sectors (Healthcare, IT, Apparel, Renewable Energy, etc.).',
          'Propose physical training centers with proposed batch capacity.'
        ]
      },
      {
        badge: 'STEP 3',
        title: 'Proposal-Specific Technical & Financial Documents',
        desc: [
          'Upload technical proposal document detailing past training performance and placement track record.',
          'Provide trainer availability certificates and industry placement tie-up letters (MoUs).',
          'Document formats supported: PDF up to 10MB per document.'
        ]
      },
      {
        badge: 'STEP 4',
        title: 'Comprehensive Proposal Preview & Legal Undertaking',
        desc: [
          'Review complete application breakdown across all 4 previous steps on a consolidated single-screen layout.',
          'Inspect attached document previews with the integrated statutory PDF viewer modal.',
          'Check mandatory statutory declaration agreeing to RTPP Act 2012 procurement guidelines.'
        ]
      },
      {
        badge: 'STEP 5',
        title: 'Earnest Money Deposit (EMD) Settlement / MSME Exemption',
        desc: [
          'Standard Option: Deposit refundable EMD (e.g., ₹ 50,000) via Cyber Treasury e-GRAS / Net Banking.',
          'MSME Waiver Option: Claim 100% EMD waiver if holding a verified Rajasthan MSME Udyam Certificate.',
          'Click "Pay & Submit EOI Application" or "Claim MSME Exemption & Submit EOI Application".'
        ]
      },
      {
        badge: 'STEP 6',
        title: 'Official Submission Confirmation & Receipt Center',
        desc: [
          'Submission triggers government confirmation popup highlighting YOUR UNIQUE EOI APPLICATION ID.',
          'One-click "Copy ID" button allows seamless copying of tracking number (e.g., ISMS-EOI-2026-9842).',
          'Download all 3 official receipts: EOI Acknowledgment, EMD Security Deposit Challan & Processing Fee Receipt.'
        ]
      }
    ];

    for (const es of eoiSteps) {
      y = drawStepBox(es.badge, es.title, es.desc, y, 17.5);
    }

    renderFooter(3);

    // =========================================================================
    // PAGE 4: SDC MONITORING, SCRUTINY, FAQS & HELPLINE CONTACTS
    // =========================================================================
    doc.addPage();
    renderHeader(4);
    y = margin + 28;

    y = drawSectionHeader('6. MODULE 4: SDC INFRASTRUCTURE & CCTV MONITORING', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    const sdcGuide = [
      '• Skill Development Centre (SDC) Accreditation: Submit classroom floor plans, computer lab specs, and power backup.',
      '• Live CCTV Integration: TPs must configure Static IP RTSP video feeds accessible by RSLDC Command & Control Centre.',
      '• Biometric AEBAS Attendance: Daily biometric punches are synchronized with state servers for trainee attendance tracking.',
      '• Milestone Disbursement: Scheme funds are released in 3 tranches: Mobilization (30%), Assessment (40%), and Placement (30%).'
    ];
    for (const sg of sdcGuide) {
      doc.text(sg, margin + 6, y);
      y += 3.8;
    }
    y += 2;

    y = drawSectionHeader('7. FREQUENTLY ASKED QUESTIONS (FAQS)', y);

    const faqs = [
      {
        q: 'Q1: What should I do if my e-GRAS payment is debited but challan is not reflected?',
        a: 'The portal performs automated treasury reconciliation every 15 minutes. Check Tender Status to refresh status.'
      },
      {
        q: 'Q2: Can I edit an EOI application after submission?',
        a: 'Yes, up to 3 edits are permitted before the Department Scrutiny Desk locks the proposal for committee evaluation.'
      },
      {
        q: 'Q3: Where can I track my submitted proposals?',
        a: 'Navigate to "Tender Status" (/tender-status). Enter your EOI Application ID to view live stage scrutiny progress.'
      }
    ];

    for (const f of faqs) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(11, 53, 88);
      doc.text(f.q, margin + 6, y);
      y += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      doc.text(f.a, margin + 6, y);
      y += 5.5;
    }

    y += 2;
    y = drawSectionHeader('8. OFFICIAL HELPLINE & NODAL SUPPORT CONTACTS', y);

    // Support Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin + 4, y, contentWidth - 8, 32, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(11, 53, 88);
    doc.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', margin + 8, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('Department of Skill, Employment and Entrepreneurship | Government of Rajasthan', margin + 8, y + 9.5);
    doc.text('Headquarters: EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004, Rajasthan, India', margin + 8, y + 13.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('• Telephone Helpline:', margin + 8, y + 18.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('0141-2716091 / +91 141 2716092 (Monday to Friday, 9:30 AM to 6:00 PM)', margin + 37, y + 18.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('• Official Support Email:', margin + 8, y + 22.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('isms-support@rajasthan.gov.in / rsldc.raj@gmail.com', margin + 41, y + 22.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('• Official Portal Web URL:', margin + 8, y + 26.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('https://livelihoods.rajasthan.gov.in (Integrated Scheme Management System)', margin + 44, y + 26.5);

    y += 36;

    // Disclaimer & Digital Signature Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 4, y, contentWidth - 8, 16, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('LEGAL NOTICE & AUTHENTICITY DISCLAIMER:', margin + 7, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('This user manual is published under the authority of RSLDC for informational guidance. Policies and RFP guidelines of individual', margin + 7, y + 8);
    doc.text('schemes shall supersede any procedural summaries contained herein. Digitally signed & verified by RSLDC IT Cell.', margin + 7, y + 11.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text('✓ DIGITALLY VERIFIED DOCUMENT (SHA-256 RSLDC-GOV-RJ)', pageWidth - margin - 8, y + 11.5, { align: 'right' });

    renderFooter(4);

    // Save and download PDF file
    doc.save('ISMS_2.0_User_Manual_Software_Guide.pdf');
  }
}
