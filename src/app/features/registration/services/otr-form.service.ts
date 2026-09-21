import { Injectable, signal, computed } from '@angular/core';
import {
  OtrFormData,
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails,
  createInitialOtrFormData,
  createExistingUserOtrData
} from '../models/otr-form.model';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OtrFormService {
  private readonly STORAGE_KEY = 'isms_otr_form_data_v3';

  private readonly _formData = signal<OtrFormData>(this.loadInitialData());

  readonly formData = computed(() => this._formData());
  readonly step1 = computed(() => this._formData().step1);
  readonly step2 = computed(() => this._formData().step2);
  readonly step3 = computed(() => this._formData().step3);
  readonly step4 = computed(() => this._formData().step4);
  readonly step5DeclarationAgreed = computed(() => this._formData().step5DeclarationAgreed);

  /** Profile / OTR Form completion percentage (0 - 100) */
  readonly completionPercentage = computed(() => {
    const data = this._formData();
    if (data.status === 'Submitted') return 100;

    let score = 0;

    // Step 1: Organization Details (Max 30%)
    const s1 = data.step1;
    const s1Fields = [s1.shortName, s1.fullName, s1.natureOfEntity, s1.registrationNumber, s1.companyPan, s1.contactNo, s1.emailId, s1.registeredAddress];
    const s1Filled = s1Fields.filter(f => !!f && f.trim().length > 0).length;
    score += Math.round((s1Filled / s1Fields.length) * 30);

    // Step 2: Officer In-Charge (Max 25%)
    const s2 = data.step2;
    if (s2 && s2.length > 0) {
      const o1 = s2[0];
      const s2Fields = [o1.name, o1.designation, o1.mobileNo, o1.emailId, o1.pan, o1.aadhaarNo];
      const s2Filled = s2Fields.filter(f => !!f && f.trim().length > 0).length;
      score += Math.round((s2Filled / s2Fields.length) * 25);
    }

    // Step 3: Authorized Signatory (Max 20%)
    const s3 = data.step3;
    const s3Fields = [s3.name, s3.dob, s3.pan, s3.mobileNo];
    const s3Filled = s3Fields.filter(f => !!f && f.trim().length > 0).length;
    score += Math.round((s3Filled / s3Fields.length) * 20);

    // Step 4: Bank Details (Max 25%)
    const s4 = data.step4;
    const s4Fields = [s4.bankName, s4.branchName, s4.accountNo, s4.ifscCode];
    const s4Filled = s4Fields.filter(f => !!f && f.trim().length > 0).length;
    score += Math.round((s4Filled / s4Fields.length) * 25);

    return Math.min(100, Math.max(0, score));
  });

  private loadInitialData(): OtrFormData {
    if (typeof localStorage !== 'undefined') {
      try {
        const userSaved = localStorage.getItem('isms_user');
        if (userSaved) {
          const user = JSON.parse(userSaved);
          if (user && user.role === 'existing_user') {
            return createExistingUserOtrData();
          }
        }
        const cached = localStorage.getItem(this.STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.step1 && parsed.step2) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Could not restore OTR draft from localStorage:', err);
      }
    }
    return createInitialOtrFormData();
  }

  loadExistingUserData(): void {
    const data = createExistingUserOtrData();
    this._formData.set(data);
    this.persistDraft(data);
  }

  resetToInitialDraft(): void {
    const data = createInitialOtrFormData();
    this._formData.set(data);
    this.persistDraft(data);
  }

  /* ==========================================================================
     Mutators: Step 1 (Organization Details)
     ========================================================================== */
  updateStep1(changes: Partial<Step1OrgDetails>): void {
    this._formData.update(current => {
      const updatedStep1: Step1OrgDetails = { ...current.step1, ...changes };

      // Handle "Same as Registered" reactive sync
      if (updatedStep1.sameAsRegistered) {
        updatedStep1.officeAddress = updatedStep1.registeredAddress;
        updatedStep1.officeState = updatedStep1.registeredState;
        updatedStep1.officeDistrict = updatedStep1.registeredDistrict;
        updatedStep1.officePincode = updatedStep1.registeredPincode;
      }

      const nextData: OtrFormData = {
        ...current,
        step1: updatedStep1
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  /* ==========================================================================
     Mutators: Step 2 (Officer In-Charge Directory)
     ========================================================================== */
  addOic(): void {
    this._formData.update(current => {
      const newOic: OfficerInCharge = {
        id: `oic-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: '',
        designation: '',
        mobileNo: '',
        emailId: '',
        pan: '',
        aadhaarNo: '',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: null,
        idProofDoc: null,
        isExpanded: true
      };

      // Collapse older records and expand newly added
      const updatedList: OfficerInCharge[] = current.step2.map(item => ({ ...item, isExpanded: false }));
      updatedList.push(newOic);

      const nextData: OtrFormData = {
        ...current,
        step2: updatedList
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  removeOic(index: number): void {
    this._formData.update(current => {
      if (current.step2.length <= 1) {
        return current; // At least 1 is required
      }
      const updatedList = [...current.step2];
      updatedList.splice(index, 1);
      // Ensure at least one is expanded
      if (updatedList.length > 0 && !updatedList.some(o => o.isExpanded)) {
        updatedList[0].isExpanded = true;
      }

      const nextData: OtrFormData = {
        ...current,
        step2: updatedList
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  updateOic(index: number, changes: Partial<OfficerInCharge>): void {
    this._formData.update(current => {
      const updatedList = [...current.step2];
      if (updatedList[index]) {
        updatedList[index] = { ...updatedList[index], ...changes };
      }

      const nextData: OtrFormData = {
        ...current,
        step2: updatedList
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  toggleOicExpand(index: number): void {
    this._formData.update(current => {
      const updatedList = current.step2.map((item, idx) => {
        if (idx === index) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        return item;
      });

      return {
        ...current,
        step2: updatedList
      };
    });
  }

  /* ==========================================================================
     Mutators: Step 3 (Authorized Signatory)
     ========================================================================== */
  updateStep3(changes: Partial<Step3AuthorizedPerson>): void {
    this._formData.update(current => {
      const updatedStep3: Step3AuthorizedPerson = { ...current.step3, ...changes };

      if (changes.dob !== undefined) {
        updatedStep3.age = this.calculateAgeFromDob(changes.dob);
      }

      const nextData: OtrFormData = {
        ...current,
        step3: updatedStep3
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  calculateAgeFromDob(dobStr: string): string {
    if (!dobStr) return '';
    try {
      const birth = new Date(dobStr);
      if (isNaN(birth.getTime())) return '';
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 0 ? age.toString() : '0';
    } catch {
      return '';
    }
  }

  /* ==========================================================================
     Mutators: Step 4 (Bank Details)
     ========================================================================== */
  updateStep4(changes: Partial<Step4BankDetails>): void {
    this._formData.update(current => {
      const nextData: OtrFormData = {
        ...current,
        step4: { ...current.step4, ...changes }
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  /* ==========================================================================
     Mutators: Step 5 (Preview & Statutory Declaration)
     ========================================================================== */
  setStep5Declaration(agreed: boolean): void {
    this._formData.update(current => {
      const nextData: OtrFormData = {
        ...current,
        step5DeclarationAgreed: agreed
      };
      this.persistDraft(nextData);
      return nextData;
    });
  }

  /* ==========================================================================
     Storage & Submission Controls
     ========================================================================== */
  saveDraft(): void {
    this.persistDraft(this._formData());
  }

  private persistDraft(data: OtrFormData): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
  }

  submitForm(): string {
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    const regId = `ISMS-OTR-2026-${randomSixDigits}`;

    this._formData.update(current => {
      const finalized: OtrFormData = {
        ...current,
        status: 'Submitted',
        registrationId: regId,
        submittedAt: new Date().toISOString()
      };
      this.persistDraft(finalized);
      return finalized;
    });

    return regId;
  }

  resetForm(): void {
    const fresh = createInitialOtrFormData();
    this._formData.set(fresh);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {}
    }
  }
}
