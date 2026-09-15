import { Injectable, signal, computed } from '@angular/core';
import { TpPiaRegistrationData, UploadedDocument } from '../models/tp-pia-registration.model';

const STORAGE_KEY = 'isms_tp_pia_registration_draft_v1';

export const INITIAL_DOCUMENTS: UploadedDocument[] = [
  { id: 'doc-reg-cert', docType: 'Registration Certificate', label: 'Organisation Registration Certificate', required: true, status: 'pending' },
  { id: 'doc-pan', docType: 'PAN Card', label: 'Organisation PAN Card', required: true, status: 'pending' },
  { id: 'doc-gst', docType: 'GST Certificate', label: 'GST Registration Certificate', required: false, status: 'pending' },
  { id: 'doc-turnover', docType: 'Audited Balance Sheet', label: 'Audited Balance Sheet / Turnover Certificate', required: false, status: 'pending' },
  { id: 'doc-bank', docType: 'Bank Proof', label: 'Cancelled Cheque / Bank Passbook', required: false, status: 'pending' },
  { id: 'doc-board-res', docType: 'Board Resolution', label: 'Board Resolution / Power of Attorney for Authorized Signatory', required: false, status: 'pending' },
  { id: 'doc-nsdc', docType: 'NSDC Certificate', label: 'NSDC Partner Certificate (If Applicable)', required: false, status: 'pending' },
  { id: 'doc-other', docType: 'Supporting Document', label: 'Additional Supporting Document', required: false, status: 'pending' },
];

export const INDIAN_STATES: string[] = [
  'Rajasthan', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const RAJASTHAN_DISTRICTS: string[] = [
  'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner',
  'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh',
  'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli',
  'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar',
  'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
];

export const NATURE_OF_ENTITIES: string[] = [
  'Private Limited Company',
  'Public Limited Company',
  'Society Registered Under Societies Act',
  'Registered Public/Private Trust',
  'Registered Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'Section 8 Company',
  'Sole Proprietorship',
  'Statutory Body / University / PSU'
];

export const SCHEME_NAMES: string[] = [
  'RSLDC - Regular Skill Training (ELSTP)',
  'DDU-GKY (Deen Dayal Upadhyaya Grameen Kaushalya Yojana)',
  'PMKVY 4.0 (Pradhan Mantri Kaushal Vikas Yojana)',
  'MMKVY (Mukhya Mantri Kaushal Vikas Yojana)',
  'Customized / Industry-Linked Skilling Programme'
];

export const BUSINESS_ACTIVITIES: string[] = [
  'Skill Training & Capacity Building',
  'Vocational Training Provider (VTP)',
  'Educational Institution / College',
  'Industrial Training Institute (ITI)',
  'Corporate Social Responsibility (CSR) Foundation',
  'Non-Governmental Organisation (NGO)',
  'Other Commercial / Service Enterprise'
];

export const APPLICANT_CATEGORIES: string[] = [
  'Training Partner (TP)',
  'Project Implementing Agency (PIA)',
  'Industry Partner',
  'Government Undertaking / PSU'
];

export const WORKFLOW_ACTIONS: string[] = [
  'Recommended for Empanelment',
  'Approved by Technical Evaluation Committee',
  'Forward to Nodal Verification Officer',
  'Under Review / Further Clarification'
];

export const MARK_TO_ROLES: string[] = [
  'Chairman, RSLDC',
  'Managing Director, RSLDC',
  'General Manager (Operations & Schemes)',
  'Joint Director (Apprenticeship & Training)',
  'Project Director (Skills)'
];

export const ID_PROOF_TYPES: string[] = [
  'Aadhaar Card',
  'PAN Card',
  'Voter ID Card',
  'Passport',
  'Driving License',
  'Bhamashah Card'
];

export const COMMON_BANKS: string[] = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Indian Bank',
  'Bank of India',
  'Central Bank of India',
  'UCO Bank',
  'Other Commercial / Scheduled Bank'
];

export const TRANSFER_MODES: string[] = [
  'RTGS',
  'NEFT',
  'ECS',
  'CBS'
];

export const ACCOUNT_TYPES: string[] = [
  'Current Account',
  'Savings Account',
  'Zero Balance Escrow Account'
];

@Injectable({
  providedIn: 'root'
})
export class TpPiaRegistrationService {
  readonly formData = signal<TpPiaRegistrationData>(this.getInitialState());
  readonly autoSaveStatus = signal<'saved' | 'saving' | 'idle'>('idle');
  readonly lastSavedTime = signal<string>('');
  readonly isSaving = computed(() => this.autoSaveStatus() === 'saving');
  readonly lastSaveMessage = signal<string>('');

  private autoSaveTimer: any = null;

  constructor() {
    this.restoreSavedDraft();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveDraftSync();
      });
    }
  }

  restoreSavedDraft(): boolean {
    const draft = this.loadFromStorage();
    if (draft && draft.basicInfo && draft.basicInfo.applicationNo) {
      this.formData.set(draft);
      if (draft.lastSaved) {
        this.lastSavedTime.set(draft.lastSaved);
        this.autoSaveStatus.set('saved');
        this.lastSaveMessage.set(`Draft automatically loaded (${draft.lastSaved})`);
      }
      return true;
    }
    return false;
  }

  getInitialState(): TpPiaRegistrationData {
    const randomAppNo = 'ISMS-TP-' + Math.floor(100000 + Math.random() * 900000);
    return {
      basicInfo: {
        applicationNo: randomAppNo,
        schemeName: '',
        shortName: '',
        fullName: '',
        registrationNumber: '',
        prnSmartNo: '',
        contactNo: '',
        emailId: '',
        website: '',
        dateOfRegistration: '',
        panNo: '',
        cinNo: '',
        gstNo: '',
      },
      entityInfo: {
        turnOver: '',
        blackListed: '',
        nsdcPartner: '',
        natureOfEntity: '',
        categoryOfApplicant: '',
        stateWhereRegistered: 'Rajasthan',
        businessActivity: '',
        eoiReferenceNo: '',
        dateOfEoiPublished: '',
      },
      registeredAddress: {
        address: '',
        state: 'Rajasthan',
        district: '',
        pincode: '',
      },
      postalAddress: {
        address: '',
        state: 'Rajasthan',
        district: '',
        pincode: '',
      },
      sameAsRegistered: false,
      workflowInfo: {
        action: '',
        markTo: '',
        markToOfficer: '',
        remarks: '',
      },
      officers: [],
      authorizedOrg: {
        name: '',
        guardianName: '',
        dob: '',
        age: '',
        designation: '',
        contactNo: '',
        emailId: '',
        pan: '',
        aadhaarNo: '',
        typeIdProof: 'Aadhaar Card',
        idNo: '',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        serviceTaxNo: '',
        residenceAddress: '',
        state: 'Rajasthan',
      },
      authorizedProject: {
        name: '',
        emailId: '',
        designation: '',
        typeIdProof: '',
        contactNo: '',
        idNo: '',
        address: '',
      },
      bankDetails: {
        bankName: '',
        accountNo: '',
        confirmAccountNo: '',
        branchName: '',
        micrCode: '',
        accountType: 'Current Account',
        ifscCode: '',
        branchAddress: '',
        electronicTransferMode: 'RTGS',
        cancelledChequeFileName: '',
        cancelledChequeFileSize: '',
      },
      awards: [],
      documents: JSON.parse(JSON.stringify(INITIAL_DOCUMENTS)),
      status: 'Draft',
    };
  }

  updateFormData(updater: (prev: TpPiaRegistrationData) => TpPiaRegistrationData) {
    this.formData.update(updater);
    this.triggerAutoSave();
  }

  triggerAutoSave(immediate = false) {
    this.autoSaveStatus.set('saving');
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    if (immediate) {
      this.saveDraftSync();
    } else {
      this.autoSaveTimer = setTimeout(() => {
        this.saveDraftSync();
      }, 400);
    }
  }

  saveDraftSync() {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const current = this.formData();
      const updated = { ...current, lastSaved: timeStr };
      this.formData.set(updated);
      this.saveToStorage(updated);
      this.lastSavedTime.set(timeStr);
      this.autoSaveStatus.set('saved');
      this.lastSaveMessage.set(`Draft saved at ${timeStr}`);
    } catch (e) {
      console.warn('Auto-save error', e);
      this.autoSaveStatus.set('idle');
    }
  }

  saveDraft(): boolean {
    this.triggerAutoSave(true);
    return true;
  }

  resetForm() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    const fresh = this.getInitialState();
    this.formData.set(fresh);
    this.lastSavedTime.set('');
    this.autoSaveStatus.set('idle');
    this.lastSaveMessage.set('Form has been reset to defaults');
  }

  populateSampleData() {
    const sample: TpPiaRegistrationData = {
      basicInfo: {
        applicationNo: 'ISMS-TP-2026-84920',
        schemeName: 'RSLDC - Regular Skill Training (ELSTP)',
        shortName: 'Kushal Skill Foundation',
        fullName: 'Kushal Skill & Entrepreneurship Foundation Pvt. Ltd.',
        registrationNumber: 'REG/RSLDC/2024/0981',
        prnSmartNo: 'SMART-RJ-88341',
        contactNo: '9829012345',
        emailId: 'admin@kushalfoundation.org',
        website: 'https://kushalfoundation.org',
        dateOfRegistration: '2018-04-16',
        panNo: 'AAACK1234F',
        cinNo: 'U80902RJ2018PTC061298',
        gstNo: '08AAACK1234F1Z5',
      },
      entityInfo: {
        turnOver: '185.50',
        blackListed: 'No',
        nsdcPartner: 'Yes',
        natureOfEntity: 'Private Limited Company',
        categoryOfApplicant: 'Training Partner (TP)',
        stateWhereRegistered: 'Rajasthan',
        businessActivity: 'Skill Training & Capacity Building',
        eoiReferenceNo: 'RSLDC/EOI/2026/04',
        dateOfEoiPublished: '2026-02-15',
      },
      registeredAddress: {
        address: 'Plot No. B-42, Malviya Industrial Area',
        state: 'Rajasthan',
        district: 'Jaipur',
        pincode: '302017',
      },
      postalAddress: {
        address: 'Plot No. B-42, Malviya Industrial Area',
        state: 'Rajasthan',
        district: 'Jaipur',
        pincode: '302017',
      },
      sameAsRegistered: true,
      workflowInfo: {
        action: 'Forward to Verification Officer',
        markTo: 'General Manager (Operations)',
        markToOfficer: 'Shri R. K. Sharma (Joint Director)',
        remarks: 'All mandatory compliance documents verified as per ISMS 2.0 standards.',
      },
      officers: [
        {
          id: 'off-1',
          name: 'Sunil Verma',
          designation: 'Managing Director & Officer In-Charge',
          mobileNo: '9829054321',
          emailId: 'sunil.verma@kushalfoundation.org',
          pan: 'ABCPV9876K',
          aadhaarNo: '987654321012',
          bhamashahNo: 'BHAM-89712',
          voterIdNo: 'RJ/04/123/98765',
          passportNo: 'Z9876543',
        }
      ],
      authorizedOrg: {
        name: 'Dr. Meenakshi Sharma',
        guardianName: 'Late Shri Rameshwar Sharma',
        dob: '1984-06-15',
        age: 42,
        designation: 'Director (Operations)',
        contactNo: '9829112233',
        emailId: 'm.sharma@kushalfoundation.org',
        pan: 'ABCPS1234E',
        aadhaarNo: '887654321908',
        typeIdProof: 'Aadhaar Card',
        idNo: '887654321908',
        bhamashahNo: 'BHAM-8971201',
        voterIdNo: 'RJ/04/123/98765',
        passportNo: 'Z9876543',
        serviceTaxNo: 'ST-08-AAACK1234F',
        residenceAddress: 'Flat 402, Royal Palms, C-Scheme, Jaipur',
        state: 'Rajasthan',
      },
      authorizedProject: {
        name: 'Rajesh Kumar',
        emailId: 'rajesh.kumar@kushalfoundation.org',
        designation: 'Project Head (Rajasthan Skilling)',
        typeIdProof: 'Aadhaar Card',
        contactNo: '9829445566',
        idNo: '776543210987',
        address: 'Centre Office, RIICO Area, Sitapura, Jaipur',
      },
      bankDetails: {
        bankName: 'State Bank of India',
        accountNo: '39876543210',
        confirmAccountNo: '39876543210',
        branchName: 'Malviya Nagar Branch, Jaipur',
        micrCode: '302002018',
        accountType: 'Current Account',
        ifscCode: 'SBIN0004129',
        branchAddress: 'Ground Floor, Commercial Complex, Sector 3, Malviya Nagar, Jaipur - 302017',
        electronicTransferMode: 'RTGS',
        cancelledChequeFileName: 'SBI_Cancelled_Cheque_39876543210.pdf',
        cancelledChequeFileSize: '1.24 MB',
      },
      awards: [
        {
          id: 'aw-1',
          awardName: 'Best Skilling Partner in Healthcare Sector',
          awardingAgency: 'National Skill Development Corporation (NSDC)',
          year: '2023',
          level: 'National',
          description: 'Awarded for training and placing over 5,000 rural candidates in allied health sciences.',
          documentName: 'NSDC_National_Award_2023.pdf',
        }
      ],
      documents: INITIAL_DOCUMENTS.map(doc => ({
        ...doc,
        fileName: doc.required ? `${doc.id}_certified.pdf` : undefined,
        fileSize: doc.required ? '1.4 MB' : undefined,
        uploadDate: doc.required ? '07/09/2026' : undefined,
        status: (doc.required ? 'uploaded' : 'pending') as 'uploaded' | 'pending'
      })),
      lastSaved: new Date().toLocaleTimeString(),
      status: 'Draft',
    };

    this.formData.set(sample);
    this.saveToStorage(sample);
    this.lastSavedTime.set(sample.lastSaved || '');
    this.autoSaveStatus.set('saved');
    this.lastSaveMessage.set('Sample government demo data loaded');
  }

  private saveToStorage(data: TpPiaRegistrationData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  private loadFromStorage(): TpPiaRegistrationData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
