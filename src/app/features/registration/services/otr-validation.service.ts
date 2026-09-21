import { Injectable, signal } from '@angular/core';
import {
  OtrFormData,
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails,
  REGEX,
  ToastInfo
} from '../models/otr-form.model';

@Injectable({
  providedIn: 'root'
})
export class OtrValidationService {
  /** Tracks steps that have had submit attempted */
  submittedSteps = signal<Set<number>>(new Set<number>());

  /** Tracks completed/valid steps */
  completedSteps = signal<Set<number>>(new Set<number>());

  /** Global feedback notification toast */
  toast = signal<ToastInfo | null>(null);

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error', stepNumber?: number): void {
    this.toast.set({ message, type, stepNumber });
    setTimeout(() => {
      this.toast.set(null);
    }, 4500);
  }

  clearToast(): void {
    this.toast.set(null);
  }

  markStepSubmitted(stepNumber: number): void {
    const next = new Set(this.submittedSteps());
    next.add(stepNumber);
    this.submittedSteps.set(next);
  }

  /* ==========================================================================
     Step 1: Organization Details Validation
     ========================================================================== */
  validateStep1(step1: Step1OrgDetails): string[] {
    const errors: string[] = [];

    if (!step1.shortName?.trim()) {
      errors.push('Organization Short Name is mandatory.');
    }
    if (!step1.fullName?.trim()) {
      errors.push('Organization Full Legal Name is mandatory.');
    }
    if (!step1.natureOfEntity?.trim()) {
      errors.push('Nature of Entity selection is mandatory.');
    }
    if (!step1.registrationNumber?.trim()) {
      errors.push('Registration / CIN Number is mandatory.');
    }
    if (!step1.dateOfRegistration) {
      errors.push('Date of Registration is mandatory.');
    } else if (new Date(step1.dateOfRegistration) > new Date()) {
      errors.push('Date of Registration cannot be a future date.');
    }
    if (!step1.stateOfLegalReg?.trim()) {
      errors.push('State/UT of Legal Registration is mandatory.');
    }
    if (!step1.registrationCertDoc || step1.registrationCertDoc.status !== 'uploaded') {
      errors.push('Certificate of Registration Document upload is mandatory.');
    }

    // Statutory & Tax
    if (!step1.companyPan?.trim()) {
      errors.push('Company PAN is mandatory.');
    } else if (!REGEX.PAN.test(step1.companyPan.toUpperCase())) {
      errors.push('Invalid Company PAN format (Required: 5 letters, 4 digits, 1 letter, e.g. ABCDE1234F).');
    }
    if (!step1.panCardDoc || step1.panCardDoc.status !== 'uploaded') {
      errors.push('Organization PAN Card Document upload is mandatory.');
    }

    if (step1.gstRegistered === 'Yes') {
      if (!step1.gstin?.trim()) {
        errors.push('GSTIN Number is mandatory when GST Registered is Yes.');
      } else if (!REGEX.GSTIN.test(step1.gstin.toUpperCase())) {
        errors.push('Invalid GSTIN format (15 characters statutory format, e.g. 08ABCDE1234F1Z5).');
      }
      if (!step1.gstCertDoc || step1.gstCertDoc.status !== 'uploaded') {
        errors.push('GST Registration Certificate upload is mandatory.');
      }
    }

    if (step1.msmeRegistered === 'Yes') {
      if (!step1.udyamNumber?.trim()) {
        errors.push('Udyam Registration Number is mandatory when MSME Registered is Yes.');
      } else if (!REGEX.UDYAM.test(step1.udyamNumber)) {
        errors.push('Invalid Udyam Number format (Required: UDYAM-XX-00-0000000).');
      }
      if (!step1.msmeCertDoc || step1.msmeCertDoc.status !== 'uploaded') {
        errors.push('MSME / Udyam Certificate upload is mandatory.');
      }
    }

    // Financial & Contact
    if (!step1.turnOver?.trim()) {
      errors.push('Turn Over (₹ in Lakhs) is mandatory.');
    } else if (isNaN(Number(step1.turnOver)) || Number(step1.turnOver) < 0) {
      errors.push('Turn Over must be a valid non-negative numeric amount.');
    }
    if (!step1.contactNo?.trim()) {
      errors.push('Company Contact Number is mandatory.');
    } else if (!REGEX.INDIAN_MOBILE.test(step1.contactNo)) {
      errors.push('Invalid Company Contact Number (Must be 10 digits starting with 6-9).');
    }
    if (!step1.emailId?.trim()) {
      errors.push('Official Company Email-ID is mandatory.');
    } else if (!REGEX.EMAIL.test(step1.emailId)) {
      errors.push('Invalid Official Company Email-ID format.');
    }
    if (step1.website?.trim() && !REGEX.URL.test(step1.website)) {
      errors.push('Invalid Website URL format.');
    }

    // Registered Address
    if (!step1.registeredAddress?.trim()) {
      errors.push('Registered Premise Address is mandatory.');
    }
    if (!step1.registeredState?.trim()) {
      errors.push('Registered State is mandatory.');
    }
    if (!step1.registeredDistrict?.trim()) {
      errors.push('Registered District is mandatory.');
    }
    if (!step1.registeredPincode?.trim()) {
      errors.push('Registered PIN Code is mandatory.');
    } else if (!REGEX.INDIAN_PIN.test(step1.registeredPincode)) {
      errors.push('Invalid Registered PIN Code (Must be 6 numeric digits not starting with 0).');
    }

    // Operational Address
    if (!step1.sameAsRegistered) {
      if (!step1.officeAddress?.trim()) {
        errors.push('Operational Office Address is mandatory.');
      }
      if (!step1.officeState?.trim()) {
        errors.push('Operational Office State is mandatory.');
      }
      if (!step1.officeDistrict?.trim()) {
        errors.push('Operational Office District is mandatory.');
      }
      if (!step1.officePincode?.trim()) {
        errors.push('Operational Office PIN Code is mandatory.');
      } else if (!REGEX.INDIAN_PIN.test(step1.officePincode)) {
        errors.push('Invalid Operational Office PIN Code (Must be 6 numeric digits).');
      }
    }

    return errors;
  }

  /* ==========================================================================
     Step 2: Officer In-Charge Directory Validation
     ========================================================================== */
  validateSingleOic(oic: OfficerInCharge, index: number): string[] {
    const prefix = `Officer #${index + 1}: `;
    const errors: string[] = [];

    if (!oic.name?.trim() || oic.name.trim().length < 2) {
      errors.push(`${prefix}Full Name is mandatory (min 2 characters).`);
    }
    if (!oic.designation?.trim()) {
      errors.push(`${prefix}Designation selection is mandatory.`);
    }
    if (!oic.mobileNo?.trim()) {
      errors.push(`${prefix}Mobile Number is mandatory.`);
    } else if (!REGEX.INDIAN_MOBILE.test(oic.mobileNo)) {
      errors.push(`${prefix}Invalid Mobile Number (10 digits starting with 6-9).`);
    }
    if (!oic.emailId?.trim()) {
      errors.push(`${prefix}Official Email-ID is mandatory.`);
    } else if (!REGEX.EMAIL.test(oic.emailId)) {
      errors.push(`${prefix}Invalid Official Email-ID.`);
    }
    if (!oic.pan?.trim()) {
      errors.push(`${prefix}PAN is mandatory.`);
    } else if (!REGEX.PAN.test(oic.pan.toUpperCase())) {
      errors.push(`${prefix}Invalid PAN format (e.g. ABCDE1234F).`);
    }
    if (!oic.aadhaarNo?.trim()) {
      errors.push(`${prefix}Aadhaar Number is mandatory.`);
    } else if (!REGEX.AADHAAR.test(oic.aadhaarNo)) {
      errors.push(`${prefix}Invalid Aadhaar Number (Must be exactly 12 digits).`);
    }
    if (oic.voterIdNo?.trim() && !REGEX.VOTER_ID.test(oic.voterIdNo.toUpperCase())) {
      errors.push(`${prefix}Invalid Voter ID format (e.g. ABC1234567).`);
    }
    if (oic.passportNo?.trim() && !REGEX.PASSPORT.test(oic.passportNo.toUpperCase())) {
      errors.push(`${prefix}Invalid Passport Number format.`);
    }
    if (!oic.appointmentLetterDoc || oic.appointmentLetterDoc.status !== 'uploaded') {
      errors.push(`${prefix}Appointment / Authorization Letter upload is mandatory.`);
    }

    return errors;
  }

  validateStep2(oicList: OfficerInCharge[]): string[] {
    const errors: string[] = [];

    if (!oicList || oicList.length === 0) {
      errors.push('At least 1 Officer In-Charge record is strictly required.');
      return errors;
    }

    oicList.forEach((oic, idx) => {
      errors.push(...this.validateSingleOic(oic, idx));
    });

    // Cross-record duplicate checks
    const pans = new Map<string, number>();
    const mobiles = new Map<string, number>();

    oicList.forEach((oic, idx) => {
      const cleanPan = oic.pan?.trim().toUpperCase();
      if (cleanPan) {
        if (pans.has(cleanPan)) {
          errors.push(`Duplicate PAN detected between Officer #${pans.get(cleanPan)! + 1} and Officer #${idx + 1} (${cleanPan}).`);
        } else {
          pans.set(cleanPan, idx);
        }
      }

      const cleanMobile = oic.mobileNo?.trim();
      if (cleanMobile) {
        if (mobiles.has(cleanMobile)) {
          errors.push(`Duplicate Mobile Number detected between Officer #${mobiles.get(cleanMobile)! + 1} and Officer #${idx + 1} (${cleanMobile}).`);
        } else {
          mobiles.set(cleanMobile, idx);
        }
      }
    });

    return errors;
  }

  /* ==========================================================================
     Step 3: Authorized Signatory Validation
     ========================================================================== */
  validateStep3(step3: Step3AuthorizedPerson): string[] {
    const errors: string[] = [];

    if (!step3.name?.trim() || step3.name.trim().length < 2) {
      errors.push('Full Name of Authorized Signatory is mandatory (min 2 chars).');
    }
    if (!step3.dob) {
      errors.push('Date of Birth is mandatory.');
    } else if (new Date(step3.dob) > new Date()) {
      errors.push('Date of Birth cannot be a future date.');
    }
    if (!step3.pan?.trim()) {
      errors.push('Personal PAN of Signatory is mandatory.');
    } else if (!REGEX.PAN.test(step3.pan.toUpperCase())) {
      errors.push('Invalid Personal PAN format (e.g. ABCDE1234F).');
    }
    if (!step3.mobileNo?.trim()) {
      errors.push('Signatory Mobile Number is mandatory.');
    } else if (!REGEX.INDIAN_MOBILE.test(step3.mobileNo)) {
      errors.push('Invalid Mobile Number (10 digits starting with 6-9).');
    }
    if (step3.emailId?.trim() && !REGEX.EMAIL.test(step3.emailId)) {
      errors.push('Invalid Email-ID format for Authorized Signatory.');
    }
    if (step3.aadhaarNo?.trim() && !REGEX.AADHAAR.test(step3.aadhaarNo)) {
      errors.push('Invalid Aadhaar Number (Must be 12 numeric digits).');
    }
    if (step3.voterIdNo?.trim() && !REGEX.VOTER_ID.test(step3.voterIdNo.toUpperCase())) {
      errors.push('Invalid Voter ID format for Authorized Signatory.');
    }
    if (step3.passportNo?.trim() && !REGEX.PASSPORT.test(step3.passportNo.toUpperCase())) {
      errors.push('Invalid Passport Number for Authorized Signatory.');
    }
    if (!step3.authorizationLetterDoc || step3.authorizationLetterDoc.status !== 'uploaded') {
      errors.push('Authorization Letter / Board Resolution document upload is mandatory.');
    }

    return errors;
  }

  /* ==========================================================================
     Step 4: Bank Details Validation
     ========================================================================== */
  validateStep4(step4: Step4BankDetails): string[] {
    const errors: string[] = [];

    if (!step4.bankName?.trim()) {
      errors.push('Bank Name selection is mandatory.');
    }
    if (!step4.branchName?.trim()) {
      errors.push('Branch Name is mandatory.');
    }
    if (!step4.transferMode?.trim()) {
      errors.push('Mode of Electronic Transfer selection is mandatory.');
    }
    if (!step4.accountType?.trim()) {
      errors.push('Type of Account selection is mandatory.');
    }
    if (!step4.accountHolderName?.trim()) {
      errors.push('Account Holder Name is mandatory.');
    }
    if (!step4.accountNo?.trim()) {
      errors.push('Bank Account Number is mandatory.');
    } else if (!REGEX.BANK_ACCOUNT.test(step4.accountNo)) {
      errors.push('Invalid Bank Account Number (Must be 9 to 18 numeric digits).');
    }
    if (!step4.ifscCode?.trim()) {
      errors.push('IFSC Code is mandatory.');
    } else if (!REGEX.IFSC.test(step4.ifscCode.toUpperCase())) {
      errors.push('Invalid IFSC Code (11 alphanumeric characters, 5th character strictly 0, e.g. SBIN0031804).');
    }
    if (step4.micrCode?.trim() && !REGEX.MICR.test(step4.micrCode)) {
      errors.push('Invalid MICR Code (Must be exactly 9 numeric digits).');
    }
    if (!step4.branchAddress?.trim()) {
      errors.push('Branch Full Postal Address is mandatory.');
    }
    if (!step4.cancelledChequeDoc || step4.cancelledChequeDoc.status !== 'uploaded') {
      errors.push('Upload of Cancelled Cheque or First Page of Bank Passbook is mandatory.');
    }

    return errors;
  }

  /* ==========================================================================
     Orchestration Helpers
     ========================================================================== */
  getStepErrors(stepNumber: number, formData: OtrFormData): string[] {
    switch (stepNumber) {
      case 1:
        return this.validateStep1(formData.step1);
      case 2:
        return this.validateStep2(formData.step2);
      case 3:
        return this.validateStep3(formData.step3);
      case 4:
        return this.validateStep4(formData.step4);
      case 5: {
        const errors: string[] = [];
        if (!formData.step5DeclarationAgreed) {
          errors.push('Statutory Legal Undertaking & Declaration agreement is required.');
        }
        return errors;
      }
      default:
        return [];
    }
  }

  isStepValid(stepNumber: number, formData: OtrFormData): boolean {
    return this.getStepErrors(stepNumber, formData).length === 0;
  }

  getFirstInvalidStep(formData: OtrFormData): number | null {
    for (let step = 1; step <= 4; step++) {
      if (!this.isStepValid(step, formData)) {
        return step;
      }
    }
    return null;
  }
}
