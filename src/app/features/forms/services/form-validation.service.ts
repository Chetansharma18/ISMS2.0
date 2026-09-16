import { Injectable, signal } from '@angular/core';
import { 
  TpPiaRegistrationData, 
  OfficerInCharge, 
  AuthorizedPersonOrg, 
  AuthorizedPersonProject, 
  BankDetails, 
  AwardItem
} from '../models/tp-pia-registration.model';

export const VALIDATION_PATTERNS = {
  mobile: /^[6-9]\d{9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  pincode: /^\d{6}$/,
  aadhaar: /^\d{12}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  micr: /^\d{9}$/,
  cin: /^[a-zA-Z0-9]{21}$/,
  bankAccount: /^\d{9,18}$/,
  url: /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i,
};

export interface TabValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  // Tracks tabs where the user attempted to proceed (Next Step / Review & Submit)
  readonly submittedTabs = signal<Set<number>>(new Set<number>());
  // Tracks tabs that have been completed by the user
  readonly completedTabs = signal<Set<number>>(new Set<number>());
  readonly toastMessage = signal<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  markTabSubmitted(tabId: number) {
    this.submittedTabs.update(prev => {
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }

  isTabSubmitted(tabId: number): boolean {
    return this.submittedTabs().has(tabId);
  }

  markTabCompleted(tabId: number) {
    this.completedTabs.update(prev => {
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }

  unmarkTabCompleted(tabId: number) {
    this.completedTabs.update(prev => {
      const next = new Set(prev);
      next.delete(tabId);
      return next;
    });
  }

  isTabCompleted(tabId: number, data: TpPiaRegistrationData): boolean {
    return this.completedTabs().has(tabId) && this.isTabValid(tabId, data);
  }

  resetSubmitted() {
    this.submittedTabs.set(new Set<number>());
    this.completedTabs.set(new Set<number>());
  }

  showToast(text: string, type: 'error' | 'success' | 'info' = 'error') {
    this.toastMessage.set({ type, text });
  }

  clearToast() {
    this.toastMessage.set(null);
  }

  // --- VALIDATOR HELPERS ---

  isValidMobile(val: string): boolean {
    return VALIDATION_PATTERNS.mobile.test((val || '').trim());
  }

  isValidEmail(val: string): boolean {
    return VALIDATION_PATTERNS.email.test((val || '').trim());
  }

  isValidPan(val: string): boolean {
    return VALIDATION_PATTERNS.pan.test((val || '').trim().toUpperCase());
  }

  isValidGst(val: string): boolean {
    return VALIDATION_PATTERNS.gstin.test((val || '').trim().toUpperCase());
  }

  isValidCin(val: string): boolean {
    return VALIDATION_PATTERNS.cin.test((val || '').trim());
  }

  isValidPincode(val: string): boolean {
    return VALIDATION_PATTERNS.pincode.test((val || '').trim());
  }

  isValidAadhaar(val: string): boolean {
    return VALIDATION_PATTERNS.aadhaar.test((val || '').trim());
  }

  isValidIfsc(val: string): boolean {
    return VALIDATION_PATTERNS.ifsc.test((val || '').trim().toUpperCase());
  }

  isValidMicr(val: string): boolean {
    return VALIDATION_PATTERNS.micr.test((val || '').trim());
  }

  isValidBankAccount(val: string): boolean {
    return VALIDATION_PATTERNS.bankAccount.test((val || '').trim());
  }

  isValidLettersOnly(val: string): boolean {
    return /^[a-zA-Z\s.]+$/.test((val || '').trim());
  }

  isValidUrl(val: string): boolean {
    const trimmed = (val || '').trim();
    if (!trimmed) return false;
    return VALIDATION_PATTERNS.url.test(trimmed);
  }

  // --- DATE & LIMIT VALIDATION HELPER ---
  validateDate(
    val: string, 
    label: string, 
    options?: { maxDate?: Date; minDate?: Date; required?: boolean; futureError?: string; minAgeError?: string }
  ): string | null {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      if (options?.required) {
        return `${label} is required`;
      }
      return null;
    }

    let day = 0, month = 0, year = 0;
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
        return `Enter a complete date (DD/MM/YYYY)`;
      }
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length !== 3 || parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
        return `Enter a complete date (DD/MM/YYYY)`;
      }
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      return `Enter date in DD/MM/YYYY format`;
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return `Enter valid numbers for date`;
    }
    if (month < 1 || month > 12) {
      return `Month must be between 01 and 12`;
    }
    if (year < 1900) {
      return `Year must be after 1900`;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return `Invalid day for this month (Max ${daysInMonth} days)`;
    }

    const inputDate = new Date(year, month - 1, day);

    if (options?.maxDate) {
      const max = new Date(options.maxDate.getFullYear(), options.maxDate.getMonth(), options.maxDate.getDate(), 23, 59, 59);
      if (inputDate > max) {
        return options.futureError || options.minAgeError || `${label} cannot be a future date`;
      }
    }

    if (options?.minDate) {
      const min = new Date(options.minDate.getFullYear(), options.minDate.getMonth(), options.minDate.getDate(), 0, 0, 0);
      if (inputDate < min) {
        return `${label} exceeds minimum allowed limit (${options.minDate.getFullYear()})`;
      }
    }

    return null;
  }

  // --- TAB 1 VALIDATION ---
  validateTab1(data: TpPiaRegistrationData): TabValidationResult {
    const errors: Record<string, string> = {};

    // Left Side Mandatory Fields
    const fullName = (data.basicInfo.fullName || '').trim();
    if (!fullName) {
      errors['basicInfo.fullName'] = 'TP/PIA Full Name is required';
    } else if (fullName.length < 3) {
      errors['basicInfo.fullName'] = 'Full Name must be at least 3 characters';
    } else if (fullName.length > 100) {
      errors['basicInfo.fullName'] = 'Full Name cannot exceed 100 characters';
    } else if (!this.isValidLettersOnly(fullName)) {
      errors['basicInfo.fullName'] = 'Full Name must contain letters and spaces only';
    }

    const shortName = (data.basicInfo.shortName || '').trim();
    if (!shortName) {
      errors['basicInfo.shortName'] = 'TP/PIA Short Name is required';
    } else if (shortName.length < 2) {
      errors['basicInfo.shortName'] = 'Short Name must be at least 2 characters';
    } else if (shortName.length > 30) {
      errors['basicInfo.shortName'] = 'Short Name cannot exceed 30 characters';
    } else if (!/^[a-zA-Z\s/&.-]+$/.test(shortName)) {
      errors['basicInfo.shortName'] = 'Short Name must contain letters, spaces and hyphens only';
    }

    // Entity Registration Number (Optional / Alphanumeric)
    const regNo = (data.basicInfo.registrationNumber || '').trim();
    if (regNo) {
      if (regNo.length < 3) {
        errors['basicInfo.registrationNumber'] = 'Registration Number must be at least 3 characters';
      } else if (regNo.length > 30) {
        errors['basicInfo.registrationNumber'] = 'Registration Number cannot exceed 30 characters';
      } else if (!/^[a-zA-Z0-9\s/&.-]+$/.test(regNo)) {
        errors['basicInfo.registrationNumber'] = 'Registration Number must be alphanumeric';
      }
    }

    // Official Website (Optional / URL format)
    const website = (data.basicInfo.website || '').trim();
    if (website) {
      if (website.length > 100) {
        errors['basicInfo.website'] = 'Official Website cannot exceed 100 characters';
      } else if (!this.isValidUrl(website)) {
        errors['basicInfo.website'] = 'Enter a valid website URL (e.g. https://www.organisation.org)';
      }
    }

    // Date of Registration (Optional, but if entered must be valid DD/MM/YYYY and cannot be in future)
    if (data.basicInfo.dateOfRegistration) {
      const dateErr = this.validateDate(data.basicInfo.dateOfRegistration, 'Date of Registration', {
        maxDate: new Date(),
        minDate: new Date(1900, 0, 1),
        futureError: 'Date of Registration cannot be in the future'
      });
      if (dateErr) {
        errors['basicInfo.dateOfRegistration'] = dateErr;
      }
    }

    const contactNo = (data.basicInfo.contactNo || '').trim();
    if (!contactNo) {
      errors['basicInfo.contactNo'] = 'Organisation Contact No. is required';
    } else if (!this.isValidMobile(contactNo)) {
      errors['basicInfo.contactNo'] = 'Enter a valid 10-digit mobile number';
    }

    const emailId = (data.basicInfo.emailId || '').trim();
    if (!emailId) {
      errors['basicInfo.emailId'] = 'Company Email-ID is required';
    } else if (!this.isValidEmail(emailId)) {
      errors['basicInfo.emailId'] = 'Enter a valid email address';
    }

    // Optional PAN in Basic Info
    const panNo = (data.basicInfo.panNo || '').trim().toUpperCase();
    if (panNo && !this.isValidPan(panNo)) {
      errors['basicInfo.panNo'] = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
    }

    // Mandatory Registered Address
    if (!(data.registeredAddress.address || '').trim()) {
      errors['registeredAddress.address'] = 'Registered address is required';
    }
    if (!(data.registeredAddress.state || '').trim()) {
      errors['registeredAddress.state'] = 'State/UT is required';
    }
    if (!(data.registeredAddress.district || '').trim()) {
      errors['registeredAddress.district'] = 'District is required';
    }
    const regPin = (data.registeredAddress.pincode || '').trim();
    if (!regPin) {
      errors['registeredAddress.pincode'] = 'Pincode is required';
    } else if (!this.isValidPincode(regPin)) {
      errors['registeredAddress.pincode'] = 'Enter a valid 6-digit pincode';
    }

    // Right Side Mandatory Fields
    const turnOver = (data.entityInfo.turnOver || '').toString().trim();
    if (!turnOver) {
      errors['entityInfo.turnOver'] = 'Turn Over is required';
    } else {
      const num = parseFloat(turnOver);
      if (isNaN(num) || num < 0) {
        errors['entityInfo.turnOver'] = 'Turn Over cannot be negative';
      } else if (num > 10000000) {
        errors['entityInfo.turnOver'] = 'Turn Over exceeds maximum allowed limit';
      }
    }

    // Mandatory Postal Address
    if (!data.sameAsRegistered) {
      if (!(data.postalAddress.address || '').trim()) {
        errors['postalAddress.address'] = 'Postal address is required';
      }
      const postPin = (data.postalAddress.pincode || '').trim();
      if (postPin && !this.isValidPincode(postPin)) {
        errors['postalAddress.pincode'] = 'Enter a valid 6-digit pincode';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // --- TAB 2 VALIDATION: Authorized Person Details (Organisation Level) ---
  validateTab2(data: TpPiaRegistrationData): TabValidationResult {
    const errors: Record<string, string> = {};
    const org = data.authorizedOrg;

    // 1. Name *
    if (!(org.name || '').trim()) {
      errors['authorizedOrg.name'] = 'Authorized Person Name is required';
    } else if (org.name.trim().length < 3) {
      errors['authorizedOrg.name'] = 'Name must be at least 3 characters';
    } else if (!this.isValidLettersOnly(org.name)) {
      errors['authorizedOrg.name'] = 'Name must contain letters and spaces only';
    }

    // S/O, D/O, W/O
    if (org.guardianName && !this.isValidLettersOnly(org.guardianName)) {
      errors['authorizedOrg.guardianName'] = 'Guardian name must contain letters and spaces only';
    }

    // 2. Date of Birth (Must be >= 18 years and <= 100 years old)
    if (org.dob) {
      const today = new Date();
      const maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const minDob = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

      const dobErr = this.validateDate(org.dob, 'Date of Birth', {
        maxDate: maxDob,
        minDate: minDob,
        minAgeError: 'Authorized Person must be at least 18 years old'
      });
      if (dobErr) {
        errors['authorizedOrg.dob'] = dobErr;
      }
    }

    // 3. Age (Limit: 18 to 100)
    if (org.age !== undefined && org.age !== null && String(org.age).trim() !== '') {
      const ageNum = Number(org.age);
      if (isNaN(ageNum) || ageNum < 18) {
        errors['authorizedOrg.age'] = 'Age must be at least 18 years';
      } else if (ageNum > 100) {
        errors['authorizedOrg.age'] = 'Age cannot exceed 100 years';
      }
    }

    // 4. Mobile No. *
    const contact = (org.contactNo || '').trim();
    if (!contact) {
      errors['authorizedOrg.contactNo'] = 'Mobile No. is required';
    } else if (!this.isValidMobile(contact)) {
      errors['authorizedOrg.contactNo'] = 'Enter a valid 10-digit mobile number';
    }

    // 5. PAN *
    const pan = (org.pan || '').trim().toUpperCase();
    if (!pan) {
      errors['authorizedOrg.pan'] = 'PAN is required';
    } else if (!this.isValidPan(pan)) {
      errors['authorizedOrg.pan'] = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
    }

    // 6. Aadhaar *
    const aadhaar = (org.aadhaarNo || '').trim();
    if (!aadhaar) {
      errors['authorizedOrg.aadhaarNo'] = 'Aadhaar Number is required';
    } else if (!this.isValidAadhaar(aadhaar)) {
      errors['authorizedOrg.aadhaarNo'] = 'Aadhaar must be exactly 12 digits';
    }

    // Optional format validations if filled
    const email = (org.emailId || '').trim();
    if (email && !this.isValidEmail(email)) {
      errors['authorizedOrg.emailId'] = 'Enter a valid email address';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateOfficer(officer: OfficerInCharge): TabValidationResult {
    const errors: Record<string, string> = {};

    if (!(officer.name || '').trim()) {
      errors['name'] = 'Officer name is required';
    } else if (!this.isValidLettersOnly(officer.name)) {
      errors['name'] = 'Officer name must contain letters and spaces only';
    }
    if (!(officer.designation || '').trim()) {
      errors['designation'] = 'Designation is required';
    }

    const mobile = (officer.mobileNo || '').trim();
    if (!mobile) {
      errors['mobileNo'] = 'Mobile No. is required';
    } else if (!this.isValidMobile(mobile)) {
      errors['mobileNo'] = 'Enter a valid 10-digit mobile number';
    }

    const email = (officer.emailId || '').trim();
    if (!email) {
      errors['emailId'] = 'Email ID is required';
    } else if (!this.isValidEmail(email)) {
      errors['emailId'] = 'Enter a valid email address';
    }

    const pan = (officer.pan || '').trim().toUpperCase();
    if (pan && !this.isValidPan(pan)) {
      errors['pan'] = 'Enter a valid 10-character PAN (e.g. ABCDE1234F)';
    }

    const aadhaar = (officer.aadhaarNo || '').trim();
    if (aadhaar && !this.isValidAadhaar(aadhaar)) {
      errors['aadhaarNo'] = 'Aadhaar must be exactly 12 digits';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // --- TAB 3 VALIDATION: Bank Details ---
  validateTab3(data: TpPiaRegistrationData): TabValidationResult {
    const errors: Record<string, string> = {};
    const bank = data.bankDetails;

    // 1. Name of the Bank *
    if (!(bank.bankName || '').trim()) {
      errors['bankDetails.bankName'] = 'Name of the Bank is required';
    }

    // 2. Account No. *
    const accNo = (bank.accountNo || '').trim();
    if (!accNo) {
      errors['bankDetails.accountNo'] = 'Account No. is required';
    } else if (!this.isValidBankAccount(accNo)) {
      errors['bankDetails.accountNo'] = 'Enter a valid Account Number (9 to 18 digits)';
    }

    // 3. IFSC Code *
    const ifsc = (bank.ifscCode || '').trim().toUpperCase();
    if (!ifsc) {
      errors['bankDetails.ifscCode'] = 'IFSC Code is required';
    } else if (!this.isValidIfsc(ifsc)) {
      errors['bankDetails.ifscCode'] = 'Enter a valid 11-character IFSC (e.g. SBIN0004129)';
    }

    // 4. Branch Name *
    if (!(bank.branchName || '').trim()) {
      errors['bankDetails.branchName'] = 'Branch Name is required';
    }

    // 5. Branch Address *
    if (!(bank.branchAddress || '').trim()) {
      errors['bankDetails.branchAddress'] = 'Branch Address is required';
    }

    // Optional: MICR Code (must be 9 digits if entered)
    const micr = (bank.micrCode || '').trim();
    if (micr && !this.isValidMicr(micr)) {
      errors['bankDetails.micrCode'] = 'MICR Code must be 9 digits';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // --- TAB 4 VALIDATION: Document Upload ---
  validateTab4(data: TpPiaRegistrationData): TabValidationResult {
    const errors: Record<string, string> = {};
    const mandatoryDocs = data.documents.filter(d => d.required);
    const missingDocs = mandatoryDocs.filter(d => d.status !== 'uploaded' || !d.fileName);

    if (missingDocs.length > 0) {
      errors['documents'] = `${missingDocs.length} mandatory document(s) must be uploaded`;
      for (const doc of missingDocs) {
        errors[`doc_${doc.id}`] = `${doc.label} is required`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // --- TAB 5 VALIDATION (Delegated to Bank Details or future step) ---
  validateTab5(data: TpPiaRegistrationData): TabValidationResult {
    return this.validateTab3(data);
  }

  // --- TAB 6 VALIDATION ---
  validateAward(award: AwardItem): TabValidationResult {
    const errors: Record<string, string> = {};
    if (!(award.awardName || '').trim()) {
      errors['awardName'] = 'Award Name is required';
    }
    if (!(award.awardingAgency || '').trim()) {
      errors['awardingAgency'] = 'Awarding Agency is required';
    }
    const year = (award.year || '').toString().trim();
    if (year && (!/^\d{4}$/.test(year) || parseInt(year, 10) < 1950 || parseInt(year, 10) > 2100)) {
      errors['year'] = 'Enter a valid 4-digit year (e.g. 2024)';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateTab6(data: TpPiaRegistrationData): TabValidationResult {
    const errors: Record<string, string> = {};
    for (let i = 0; i < data.awards.length; i++) {
      const res = this.validateAward(data.awards[i]);
      if (!res.isValid) {
        errors[`awards[${i}]`] = `Award #${i + 1} has invalid details`;
      }
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // --- TAB 7 VALIDATION ---
  validateTab7(data: TpPiaRegistrationData): TabValidationResult {
    return this.validateTab4(data);
  }

  // Memoization cache to avoid recalculating validations multiple times per change detection cycle
  private validationCache = new Map<number, { dataRef: any; result: TabValidationResult }>();

  clearValidationCache() {
    this.validationCache.clear();
  }

  // --- OVERALL AUDIT ---
  getTabValidation(tabId: number, data: TpPiaRegistrationData): TabValidationResult {
    const cached = this.validationCache.get(tabId);
    if (cached && cached.dataRef === data) {
      return cached.result;
    }

    let result: TabValidationResult;
    switch (tabId) {
      case 1: result = this.validateTab1(data); break;
      case 2: result = this.validateTab2(data); break;
      case 3: result = this.validateTab3(data); break;
      case 4: result = this.validateTab4(data); break;
      default: result = { isValid: true, errors: {} }; break;
    }

    this.validationCache.set(tabId, { dataRef: data, result });
    return result;
  }

  isTabValid(tabId: number, data: TpPiaRegistrationData): boolean {
    return this.getTabValidation(tabId, data).isValid;
  }

  getFirstInvalidTab(data: TpPiaRegistrationData): number | null {
    for (let tabId = 1; tabId <= 4; tabId++) {
      if (!this.isTabValid(tabId, data)) {
        return tabId;
      }
    }
    return null;
  }
}
