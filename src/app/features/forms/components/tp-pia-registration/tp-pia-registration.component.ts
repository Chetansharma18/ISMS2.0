import { Component, inject, signal, computed, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  TpPiaRegistrationService,
  INDIAN_STATES,
  RAJASTHAN_DISTRICTS,
  BUSINESS_ACTIVITIES,
  ID_PROOF_TYPES,
  COMMON_BANKS,
  TRANSFER_MODES,
  ACCOUNT_TYPES
} from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';
import {
  OfficerInCharge,
  AwardItem,
  UploadedDocument,
  TpPiaRegistrationData
} from '../../models/tp-pia-registration.model';

export interface TabItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: string;
}

@Component({
  selector: 'app-tp-pia-registration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './tp-pia-registration.component.html',
  styleUrl: './tp-pia-registration.component.scss'
})
export class TpPiaRegistrationComponent {
  readonly service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);
  readonly Math = Math;

  // --- STEPPER & TAB STATE ---
  readonly activeTab = signal<number>(1);
  readonly showSuccessModal = signal<boolean>(false);
  readonly fontScale = signal<'standard' | 'large' | 'xlarge'>('standard');
  declarationAgreed: boolean = false;

  // --- ACCORDION / DROPDOWN STATES ---
  // Step 1 Sections: 1st is open by default, rest closed
  readonly isOrgProfileOpen = signal<boolean>(true);
  readonly isContactDetailsOpen = signal<boolean>(false);
  readonly isAddressRecordsOpen = signal<boolean>(false);

  // Step 5 Review Sections: 1st block & 1st sub-accordion open by default, rest closed
  readonly isReviewStep1Open = signal<boolean>(true);
  readonly isReviewOrgProfileOpen = signal<boolean>(true);
  readonly isReviewContactOpen = signal<boolean>(false);
  readonly isReviewAddressOpen = signal<boolean>(false);
  readonly isReviewAuthPersonOpen = signal<boolean>(false);
  readonly isReviewBankOpen = signal<boolean>(false);
  readonly isReviewDocsOpen = signal<boolean>(false);

  readonly tabs: TabItem[] = [
    { id: 1, label: 'Organisation Details', shortLabel: 'Organisation', icon: '🏢' },
    { id: 2, label: 'Auth Person (Org)', shortLabel: 'Auth (Org)', icon: '✍️' },
    { id: 3, label: 'Bank Details', shortLabel: 'Bank Details', icon: '🏦' },
    { id: 4, label: 'Document Upload', shortLabel: 'Documents', icon: '📁' },
    { id: 5, label: 'Review & Submit', shortLabel: 'Review', icon: '📋' },
  ];

  get currentStepInfo(): { title: string; subtitle: string } {
    switch (this.activeTab()) {
      case 1:
        return {
          title: 'Step 1: Organisation / Company Basic Details',
          subtitle: 'Primary profile, legal constitution, address records, and workflow authority'
        };
      case 2:
        return {
          title: 'Step 2: Authorized Person Details (Organisation Level)',
          subtitle: 'Statutory corporate signatory, identity proofs, and legal credentials'
        };
      case 3:
        return {
          title: 'Step 3: Bank Details',
          subtitle: 'PFMS / DBT disbursal dedicated bank account, transfer mode, and verification records'
        };
      case 4:
        return {
          title: 'Step 4: Document Upload',
          subtitle: 'Mandatory statutory compliance documents, registration certificate, PAN, GST, and affidavits'
        };
      case 5:
        return {
          title: 'Step 5: Review & Final Submission',
          subtitle: 'Review all application details, edit any section if needed, and submit the application'
        };
      default:
        return {
          title: `Step ${this.activeTab()}`,
          subtitle: 'Application form details'
        };
    }
  }

  get data(): TpPiaRegistrationData {
    return this.service.formData();
  }

  // --- DATA CHANGE DEBOUNCE ---
  private changeTimer: any;
  onDataChange() {
    if (this.changeTimer) clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      this.service.updateFormData(curr => ({ ...curr }));
    }, 60);
  }

  // --- VALIDATION COMPUTATIONS & HELPERS ---
  readonly tab1Errors = computed(() => this.valService.validateTab1(this.service.formData()).errors);
  readonly tab2Errors = computed(() => this.valService.validateTab2(this.service.formData()).errors);
  readonly tab3Errors = computed(() => this.valService.validateTab3(this.service.formData()).errors);
  readonly tab4ProjectErrors = computed(() => this.valService.validateTab4(this.service.formData()).errors);

  readonly errors = computed(() => ({
    ...this.tab1Errors(),
    ...this.tab2Errors(),
    ...this.tab3Errors(),
    ...this.tab4ProjectErrors(),
  }));

  private getFieldValue(fieldKey: string): any {
    const parts = fieldKey.split('.');
    let curr: any = this.data;
    for (const part of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[part];
    }
    return curr;
  }

  isFieldInvalid(fieldKey: string): boolean {
    const error = this.errors()[fieldKey];
    if (!error) return false;

    const val = this.getFieldValue(fieldKey);
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) {
      return true;
    }

    if (fieldKey.startsWith('basicInfo') || fieldKey.startsWith('entityInfo') || fieldKey.startsWith('registeredAddress') || fieldKey.startsWith('postalAddress')) {
      return this.valService.isTabSubmitted(1);
    }
    if (fieldKey.startsWith('authorizedOrg')) {
      return this.valService.isTabSubmitted(2);
    }
    if (fieldKey.startsWith('bankDetails')) {
      return this.valService.isTabSubmitted(3);
    }
    if (fieldKey.startsWith('authorizedProject')) {
      return this.valService.isTabSubmitted(4);
    }

    return this.valService.isTabSubmitted(this.activeTab());
  }

  getFieldError(fieldKey: string): string {
    return this.isFieldInvalid(fieldKey) ? (this.errors()[fieldKey] || '') : '';
  }

  readonly tabStatuses = computed(() => {
    const data = this.service.formData();
    const submitted = this.valService.submittedTabs();
    const completed = this.valService.completedTabs();

    const map: Record<number, { isCompleted: boolean; isSubmittedInvalid: boolean }> = {};
    for (let id = 1; id <= 5; id++) {
      const isValid = id === 5
        ? (this.valService.isTabValid(1, data) && this.valService.isTabValid(2, data) && this.valService.isTabValid(3, data) && this.valService.isTabValid(4, data))
        : this.valService.isTabValid(id, data);
      map[id] = {
        isCompleted: completed.has(id) && isValid,
        isSubmittedInvalid: submitted.has(id) && !isValid,
      };
    }
    return map;
  });

  isTabValid(tabId: number): boolean {
    return this.valService.isTabValid(tabId, this.data);
  }

  isTabCompleted(tabId: number): boolean {
    return this.tabStatuses()[tabId]?.isCompleted ?? false;
  }

  isTabSubmittedInvalid(tabId: number): boolean {
    return this.tabStatuses()[tabId]?.isSubmittedInvalid ?? false;
  }

  // --- STEP 1: ORGANISATION DETAILS SPECIFICS ---
  readonly states = INDIAN_STATES;
  readonly districts = RAJASTHAN_DISTRICTS;
  readonly businessActivities = BUSINESS_ACTIVITIES;
  readonly commonBanks = COMMON_BANKS;

  // 1. Searchable District Dropdown
  readonly isDistrictDropdownOpen = signal<boolean>(false);
  readonly districtSearchQuery = signal<string>('');
  readonly filteredDistricts = computed(() => {
    const q = this.districtSearchQuery().toLowerCase().trim();
    if (!q) return this.districts;
    return this.districts.filter(d => d.toLowerCase().includes(q));
  });

  closeAllDropdowns() {
    this.isDistrictDropdownOpen.set(false);
    this.isStateRegDropdownOpen.set(false);
    this.isStateAddrDropdownOpen.set(false);
    this.isStateAuthDropdownOpen.set(false);
    this.isBankDropdownOpen.set(false);
  }

  toggleDistrictDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const nextState = !this.isDistrictDropdownOpen();
    this.closeAllDropdowns();
    this.isDistrictDropdownOpen.set(nextState);
    if (nextState) {
      this.districtSearchQuery.set('');
      setTimeout(() => {
        const input = document.getElementById('district-search-input');
        if (input) input.focus();
      }, 50);
    }
  }

  selectDistrict(dist: string) {
    this.data.registeredAddress.district = dist;
    this.isDistrictDropdownOpen.set(false);
    this.districtSearchQuery.set('');
    this.onRegisteredAddressChange();
  }

  clearDistrict(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.data.registeredAddress.district = '';
    this.districtSearchQuery.set('');
    this.onRegisteredAddressChange();
  }

  // 2. Searchable State Where Registered Dropdown
  readonly isStateRegDropdownOpen = signal<boolean>(false);
  readonly stateRegSearchQuery = signal<string>('');
  readonly filteredStatesReg = computed(() => {
    const q = this.stateRegSearchQuery().toLowerCase().trim();
    if (!q) return this.states;
    return this.states.filter(s => s.toLowerCase().includes(q));
  });

  toggleStateRegDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const nextState = !this.isStateRegDropdownOpen();
    this.closeAllDropdowns();
    this.isStateRegDropdownOpen.set(nextState);
    if (nextState) {
      this.stateRegSearchQuery.set('');
      setTimeout(() => {
        const input = document.getElementById('statereg-search-input');
        if (input) input.focus();
      }, 50);
    }
  }

  selectStateReg(state: string) {
    this.data.entityInfo.stateWhereRegistered = state;
    this.isStateRegDropdownOpen.set(false);
    this.stateRegSearchQuery.set('');
    this.onDataChange();
  }

  clearStateReg(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.data.entityInfo.stateWhereRegistered = '';
    this.stateRegSearchQuery.set('');
    this.onDataChange();
  }

  // 3. Searchable State/UT for Registered Address
  readonly isStateAddrDropdownOpen = signal<boolean>(false);
  readonly stateAddrSearchQuery = signal<string>('');
  readonly filteredStatesAddr = computed(() => {
    const q = this.stateAddrSearchQuery().toLowerCase().trim();
    if (!q) return this.states;
    return this.states.filter(s => s.toLowerCase().includes(q));
  });

  toggleStateAddrDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const nextState = !this.isStateAddrDropdownOpen();
    this.closeAllDropdowns();
    this.isStateAddrDropdownOpen.set(nextState);
    if (nextState) {
      this.stateAddrSearchQuery.set('');
      setTimeout(() => {
        const input = document.getElementById('stateaddr-search-input');
        if (input) input.focus();
      }, 50);
    }
  }

  selectStateAddr(state: string) {
    this.data.registeredAddress.state = state;
    this.isStateAddrDropdownOpen.set(false);
    this.stateAddrSearchQuery.set('');
    this.onRegisteredAddressChange();
  }

  clearStateAddr(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.data.registeredAddress.state = '';
    this.stateAddrSearchQuery.set('');
    this.onRegisteredAddressChange();
  }

  // 4. Searchable State for Authorized Person
  readonly isStateAuthDropdownOpen = signal<boolean>(false);
  readonly stateAuthSearchQuery = signal<string>('');
  readonly filteredStatesAuth = computed(() => {
    const q = this.stateAuthSearchQuery().toLowerCase().trim();
    if (!q) return this.states;
    return this.states.filter(s => s.toLowerCase().includes(q));
  });

  toggleStateAuthDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const nextState = !this.isStateAuthDropdownOpen();
    this.closeAllDropdowns();
    this.isStateAuthDropdownOpen.set(nextState);
    if (nextState) {
      this.stateAuthSearchQuery.set('');
      setTimeout(() => {
        const input = document.getElementById('stateauth-search-input');
        if (input) input.focus();
      }, 50);
    }
  }

  selectStateAuth(state: string) {
    this.data.authorizedOrg.state = state;
    this.isStateAuthDropdownOpen.set(false);
    this.stateAuthSearchQuery.set('');
    this.onDataChange();
  }

  clearStateAuth(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.data.authorizedOrg.state = '';
    this.stateAuthSearchQuery.set('');
    this.onDataChange();
  }

  // 5. Searchable Bank Name for Step 3
  readonly isBankDropdownOpen = signal<boolean>(false);
  readonly bankSearchQuery = signal<string>('');
  readonly filteredBanks = computed(() => {
    const q = this.bankSearchQuery().toLowerCase().trim();
    if (!q) return this.commonBanks;
    return this.commonBanks.filter(b => b.toLowerCase().includes(q));
  });

  toggleBankDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const nextState = !this.isBankDropdownOpen();
    this.closeAllDropdowns();
    this.isBankDropdownOpen.set(nextState);
    if (nextState) {
      this.bankSearchQuery.set('');
      setTimeout(() => {
        const input = document.getElementById('bank-search-input');
        if (input) input.focus();
      }, 50);
    }
  }

  selectBank(bank: string) {
    this.data.bankDetails.bankName = bank;
    this.isBankDropdownOpen.set(false);
    this.bankSearchQuery.set('');
    this.onDataChange();
  }

  clearBank(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.data.bankDetails.bankName = '';
    this.bankSearchQuery.set('');
    this.onDataChange();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.district-dropdown-container')) {
      this.isDistrictDropdownOpen.set(false);
    }
    if (!target.closest('.statereg-dropdown-container')) {
      this.isStateRegDropdownOpen.set(false);
    }
    if (!target.closest('.stateaddr-dropdown-container')) {
      this.isStateAddrDropdownOpen.set(false);
    }
    if (!target.closest('.stateauth-dropdown-container')) {
      this.isStateAuthDropdownOpen.set(false);
    }
    if (!target.closest('.bank-dropdown-container')) {
      this.isBankDropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    this.isDistrictDropdownOpen.set(false);
    this.isStateRegDropdownOpen.set(false);
    this.isStateAddrDropdownOpen.set(false);
    this.isStateAuthDropdownOpen.set(false);
    this.isBankDropdownOpen.set(false);
  }

  toggleSameAddress() {
    if (this.data.sameAsRegistered) {
      const reg = this.data.registeredAddress;
      const full = [reg.address, reg.district, reg.state, reg.pincode ? `PIN: ${reg.pincode}` : ''].filter(Boolean).join(', ');
      this.data.postalAddress.address = full;
      this.data.postalAddress.state = reg.state;
      this.data.postalAddress.district = reg.district;
      this.data.postalAddress.pincode = reg.pincode;
    }
    this.service.updateFormData(curr => ({ ...curr }));
  }

  onRegisteredAddressChange() {
    if (this.data.sameAsRegistered) {
      this.toggleSameAddress();
    }
    this.onDataChange();
  }

  // --- STEP 2: AUTHORIZED PERSON (ORG LEVEL) SPECIFICS ---
  readonly idTypes = ID_PROOF_TYPES.filter(t => t !== 'Aadhaar Card' && t !== 'PAN Card');

  constructor() {
    if (this.data.authorizedOrg.typeIdProof === 'PAN Card' || this.data.authorizedOrg.typeIdProof === 'Aadhaar Card') {
      this.data.authorizedOrg.typeIdProof = '';
    }
  }

  // --- DATE DD/MM/YYYY FORMATTING & PICKER HELPERS ---
  get todayIso(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get maxDobIso(): string {
    const today = new Date();
    const y = today.getFullYear() - 18;
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get minDobIso(): string {
    const today = new Date();
    const y = today.getFullYear() - 100;
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateDisplay(dateStr?: string): string {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
    }
    return trimmed;
  }

  getIsoDate(dateStr?: string): string {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return trimmed;
      }
    }
    return '';
  }

  onDateInput(event: Event, field: 'registration' | 'dob') {
    const input = event.target as HTMLInputElement;
    const val = input.value || '';
    const rawDigits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (rawDigits.length > 4) {
      formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2, 4)}/${rawDigits.slice(4)}`;
    } else if (rawDigits.length > 2) {
      formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2)}`;
    } else {
      formatted = rawDigits;
    }
    input.value = formatted;

    if (field === 'registration') {
      this.data.basicInfo.dateOfRegistration = formatted;
      this.onDataChange();
    } else if (field === 'dob') {
      this.data.authorizedOrg.dob = formatted;
      this.onDobChange();
    }
  }

  onDatePick(event: Event, field: 'registration' | 'dob') {
    const input = event.target as HTMLInputElement;
    const isoVal = input.value;
    if (!isoVal) return;
    const parts = isoVal.split('-');
    if (parts.length === 3) {
      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      if (field === 'registration') {
        this.data.basicInfo.dateOfRegistration = formatted;
        this.onDataChange();
      } else if (field === 'dob') {
        this.data.authorizedOrg.dob = formatted;
        this.onDobChange();
      }
    }
  }

  openPicker(picker: HTMLInputElement) {
    if (picker) {
      if (typeof picker.showPicker === 'function') {
        try {
          picker.showPicker();
          return;
        } catch {
          // fallback
        }
      }
      picker.focus();
      picker.click();
    }
  }

  onDobChange() {
    const val = (this.data.authorizedOrg.dob || '').trim();
    if (val) {
      let birthDate: Date | null = null;
      if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          birthDate = new Date(y, m, d);
        }
      } else if (val.includes('-')) {
        const parts = val.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          birthDate = new Date(y, m, d);
        }
      }
      if (birthDate && !isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 0 && age <= 120) {
          this.data.authorizedOrg.age = age;
        }
      }
    }
    this.onDataChange();
  }

  onTypeIdProofChange() {
    const type = this.data.authorizedOrg.typeIdProof;
    if (type === 'Voter ID Card') {
      if (this.data.authorizedOrg.voterIdNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.voterIdNo;
      }
    } else if (type === 'Passport') {
      if (this.data.authorizedOrg.passportNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.passportNo;
      }
    } else if (type === 'Bhamashah Card') {
      if (this.data.authorizedOrg.bhamashahNo) {
        this.data.authorizedOrg.idNo = this.data.authorizedOrg.bhamashahNo;
      }
    } else if (!type) {
      this.data.authorizedOrg.idNo = '';
    }
    this.onDataChange();
  }

  onAadhaarChange() {
    if (this.data.authorizedOrg.aadhaarNo) {
      this.data.authorizedOrg.aadhaarNo = this.data.authorizedOrg.aadhaarNo.replace(/\D/g, '').slice(0, 12);
    }
    this.onDataChange();
  }

  onVoterIdChange() {
    this.data.authorizedOrg.voterIdNo = (this.data.authorizedOrg.voterIdNo || '').toUpperCase();
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.voterIdNo;
    this.onDataChange();
  }

  onPassportChange() {
    this.data.authorizedOrg.passportNo = (this.data.authorizedOrg.passportNo || '').toUpperCase();
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.passportNo;
    this.onDataChange();
  }

  onBhamashahChange() {
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.bhamashahNo || '';
    this.onDataChange();
  }

  onPanChange() {
    this.data.authorizedOrg.pan = (this.data.authorizedOrg.pan || '').toUpperCase();
    this.data.authorizedOrg.idNo = this.data.authorizedOrg.pan;
    this.onDataChange();
  }

  // --- STEP 3: BANK DETAILS SPECIFICS ---
  readonly transferModes = TRANSFER_MODES;
  readonly accountTypes = ACCOUNT_TYPES;

  readonly isBankDragging = signal<boolean>(false);
  readonly bankFileError = signal<string>('');

  onBankDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isBankDragging.set(true);
  }

  onBankDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isBankDragging.set(false);
  }

  onBankFileDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isBankDragging.set(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleBankFile(e.dataTransfer.files[0]);
    }
  }

  onBankFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleBankFile(input.files[0]);
    }
    input.value = '';
  }

  private handleBankFile(file: File) {
    this.bankFileError.set('');
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxBytes) {
      this.bankFileError.set(`"${file.name}" exceeds the maximum 5 MB limit.`);
      return;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      this.bankFileError.set(`Invalid file type "${file.name}". Please upload PDF, JPG, or PNG.`);
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const dateFormatted = new Date().toLocaleDateString('en-GB');

    this.service.updateFormData(curr => ({
      ...curr,
      bankDetails: {
        ...curr.bankDetails,
        cancelledChequeFileName: file.name,
        cancelledChequeFileSize: sizeFormatted,
      },
      documents: curr.documents.map(d => d.id === 'doc-bank' ? {
        ...d,
        fileName: file.name,
        fileSize: sizeFormatted,
        uploadDate: dateFormatted,
        status: 'uploaded' as const
      } : d)
    }));
  }

  removeBankFile() {
    this.bankFileError.set('');
    this.service.updateFormData(curr => ({
      ...curr,
      bankDetails: {
        ...curr.bankDetails,
        cancelledChequeFileName: '',
        cancelledChequeFileSize: '',
      },
      documents: curr.documents.map(d => d.id === 'doc-bank' ? {
        ...d,
        fileName: undefined,
        fileSize: undefined,
        uploadDate: undefined,
        status: 'pending' as const
      } : d)
    }));
  }

  // --- STEP 4: DOCUMENT UPLOAD SPECIFICS ---
  readonly docErrorMessage = signal<string>('');
  readonly previewingDoc = signal<UploadedDocument | null>(null);

  get documents(): UploadedDocument[] {
    return this.service.formData().documents;
  }

  get totalRequiredCount(): number {
    return this.documents.filter(d => d.required).length;
  }

  get uploadedRequiredCount(): number {
    return this.documents.filter(d => d.required && d.status === 'uploaded').length;
  }

  get isTab4Submitted(): boolean {
    return this.valService.isTabSubmitted(4);
  }

  get isTab4Invalid(): boolean {
    return this.isTab4Submitted && (this.uploadedRequiredCount < this.totalRequiredCount);
  }

  onDocFileSelected(event: Event, docId: string) {
    this.docErrorMessage.set('');
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxBytes) {
      this.docErrorMessage.set(`"${file.name}" exceeds the 5 MB maximum limit.`);
      input.value = '';
      return;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      this.docErrorMessage.set(`Invalid file format for "${file.name}". Please upload PDF, JPG, or PNG.`);
      input.value = '';
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const dateFormatted = new Date().toLocaleDateString('en-GB');

    this.service.updateFormData(curr => ({
      ...curr,
      documents: curr.documents.map(d => d.id === docId ? {
        ...d,
        fileName: file.name,
        fileSize: sizeFormatted,
        uploadDate: dateFormatted,
        status: 'uploaded'
      } : d)
    }));

    input.value = '';
  }

  removeDocument(docId: string) {
    this.service.updateFormData(curr => ({
      ...curr,
      documents: curr.documents.map(d => d.id === docId ? {
        ...d,
        fileName: undefined,
        fileSize: undefined,
        uploadDate: undefined,
        status: 'pending'
      } : d)
    }));
  }

  // --- OFFICER IN-CHARGE LOGIC (from tab-officer-incharge) ---
  readonly showOfficerModal = signal<boolean>(false);
  readonly isOfficerEditing = signal<boolean>(false);
  readonly modalOfficerSubmitted = signal<boolean>(false);
  readonly isOfficerOpen = signal<boolean>(true);
  currentOfficer: OfficerInCharge = this.getEmptyOfficer();

  get officers(): OfficerInCharge[] {
    return this.service.formData().officers;
  }

  get isOfficerTabInvalid(): boolean {
    return this.valService.isTabSubmitted(2) && !this.valService.isTabValid(2, this.service.formData());
  }

  get officerErrors(): Record<string, string> {
    return this.valService.validateOfficer(this.currentOfficer).errors;
  }

  isOfficerModalFieldInvalid(field: keyof OfficerInCharge): boolean {
    const error = this.officerErrors[field];
    if (!error) return false;
    const val = this.currentOfficer[field];
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) return true;
    return this.modalOfficerSubmitted();
  }

  getOfficerModalFieldError(field: keyof OfficerInCharge): string {
    return this.isOfficerModalFieldInvalid(field) ? (this.officerErrors[field] || '') : '';
  }

  openAddOfficerModal() {
    this.isOfficerEditing.set(false);
    this.modalOfficerSubmitted.set(false);
    this.currentOfficer = this.getEmptyOfficer();
    this.showOfficerModal.set(true);
  }

  editOfficer(off: OfficerInCharge) {
    this.isOfficerEditing.set(true);
    this.modalOfficerSubmitted.set(false);
    this.currentOfficer = { ...off };
    this.showOfficerModal.set(true);
  }

  deleteOfficer(id: string) {
    if (confirm('Are you sure you want to remove this officer record?')) {
      this.service.updateFormData(curr => ({
        ...curr,
        officers: curr.officers.filter(o => o.id !== id)
      }));
    }
  }

  saveOfficer() {
    this.modalOfficerSubmitted.set(true);
    const validation = this.valService.validateOfficer(this.currentOfficer);
    if (!validation.isValid) return;

    if (this.isOfficerEditing()) {
      this.service.updateFormData(curr => ({
        ...curr,
        officers: curr.officers.map(o => o.id === this.currentOfficer.id ? this.currentOfficer : o)
      }));
    } else {
      this.service.updateFormData(curr => ({
        ...curr,
        officers: [...curr.officers, { ...this.currentOfficer, id: 'off-' + Date.now() }]
      }));
    }
    this.closeOfficerModal();
  }

  closeOfficerModal() {
    this.showOfficerModal.set(false);
  }

  private getEmptyOfficer(): OfficerInCharge {
    return {
      id: '',
      name: '',
      designation: '',
      mobileNo: '',
      emailId: '',
      pan: '',
      aadhaarNo: '',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
    };
  }

  // --- AWARDS RECORD LOGIC (from tab-awards) ---
  readonly showAwardModal = signal<boolean>(false);
  readonly isAwardEditing = signal<boolean>(false);
  readonly modalAwardSubmitted = signal<boolean>(false);
  readonly isAwardOpen = signal<boolean>(true);
  currentAward: AwardItem = this.getEmptyAward();

  get awards(): AwardItem[] {
    return this.service.formData().awards;
  }

  get awardErrors(): Record<string, string> {
    return this.valService.validateAward(this.currentAward).errors;
  }

  isAwardModalFieldInvalid(field: keyof AwardItem): boolean {
    const error = this.awardErrors[field];
    if (!error) return false;
    const val = this.currentAward[field];
    const hasValue = val !== undefined && val !== null && String(val).trim().length > 0;
    if (hasValue) return true;
    return this.modalAwardSubmitted();
  }

  getAwardModalFieldError(field: keyof AwardItem): string {
    return this.isAwardModalFieldInvalid(field) ? (this.awardErrors[field] || '') : '';
  }

  openAddAwardModal() {
    this.isAwardEditing.set(false);
    this.modalAwardSubmitted.set(false);
    this.currentAward = this.getEmptyAward();
    this.showAwardModal.set(true);
  }

  editAward(award: AwardItem) {
    this.isAwardEditing.set(true);
    this.modalAwardSubmitted.set(false);
    this.currentAward = { ...award };
    this.showAwardModal.set(true);
  }

  deleteAward(id: string) {
    if (confirm('Delete this award record?')) {
      this.service.updateFormData(curr => ({
        ...curr,
        awards: curr.awards.filter(a => a.id !== id)
      }));
    }
  }

  onAwardFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.currentAward.documentName = input.files[0].name;
    }
  }

  saveAward() {
    this.modalAwardSubmitted.set(true);
    const validation = this.valService.validateAward(this.currentAward);
    if (!validation.isValid) return;

    if (this.isAwardEditing()) {
      this.service.updateFormData(curr => ({
        ...curr,
        awards: curr.awards.map(a => a.id === this.currentAward.id ? this.currentAward : a)
      }));
    } else {
      this.service.updateFormData(curr => ({
        ...curr,
        awards: [...curr.awards, { ...this.currentAward, id: 'aw-' + Date.now() }]
      }));
    }
    this.closeAwardModal();
  }

  closeAwardModal() {
    this.showAwardModal.set(false);
  }

  private getEmptyAward(): AwardItem {
    return {
      id: '',
      awardName: '',
      awardingAgency: '',
      year: new Date().getFullYear().toString(),
      level: 'National',
      description: '',
    };
  }

  // --- STEPPER NAVIGATION & FORM ACTIONS ---
  private scrollStepIntoView(tabId: number) {
    if (typeof document !== 'undefined') {
      requestAnimationFrame(() => {
        const el = document.getElementById(`step-btn-${tabId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }
  }

  switchTab(tabId: number) {
    this.closeAllDropdowns();
    const current = this.activeTab();
    if (this.valService.isTabValid(current, this.data)) {
      this.valService.markTabCompleted(current);
    }
    this.service.saveDraftSync();
    this.activeTab.set(tabId);
    this.valService.clearToast();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.scrollStepIntoView(tabId);
  }

  nextTab() {
    this.closeAllDropdowns();
    const current = this.activeTab();
    this.valService.markTabSubmitted(current);

    if (current <= 4 && !this.valService.isTabValid(current, this.data)) {
      const tabName = this.tabs[current - 1]?.label || `Tab ${current}`;
      this.valService.showToast(`Please fill all required fields correctly in "${tabName}" before proceeding.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.valService.markTabCompleted(current);
    this.valService.clearToast();
    this.service.saveDraftSync();
    if (current < 5) {
      const nextId = current + 1;
      this.activeTab.set(nextId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.scrollStepIntoView(nextId);
    }
  }

  prevTab() {
    this.closeAllDropdowns();
    if (this.activeTab() > 1) {
      this.service.saveDraftSync();
      const prevId = this.activeTab() - 1;
      this.activeTab.set(prevId);
      this.valService.clearToast();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.scrollStepIntoView(prevId);
    }
  }

  populateDemo() {
    this.service.populateSampleData();
    for (let t = 1; t <= 5; t++) {
      if (this.valService.isTabValid(t, this.data)) {
        this.valService.markTabCompleted(t);
      }
    }
    this.valService.showToast('Sample government demo data loaded.', 'success');
  }

  openPreviewModal() {
    this.switchTab(5);
  }

  openReviewModal() {
    this.switchTab(5);
  }

  submitFinalApplication() {
    if (!this.declarationAgreed) {
      this.valService.showToast('Please check the declaration checkbox before submitting.');
      return;
    }

    for (let t = 1; t <= 4; t++) {
      this.valService.markTabSubmitted(t);
    }

    const firstInvalid = this.valService.getFirstInvalidTab(this.data);
    if (firstInvalid !== null) {
      this.activeTab.set(firstInvalid);
      const tabName = this.tabs[firstInvalid - 1]?.label || `Step ${firstInvalid}`;
      this.valService.showToast(`Cannot submit application: Please complete mandatory fields in "${tabName}".`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.valService.markTabCompleted(5);
    this.valService.clearToast();
    this.service.updateFormData(curr => ({ ...curr, status: 'Submitted' }));
    this.showSuccessModal.set(true);
  }

  confirmSubmit() {
    this.submitFinalApplication();
  }

  printAcknowledgement() {
    window.print();
  }

  setFontScale(scale: 'standard' | 'large' | 'xlarge') {
    this.fontScale.set(scale);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('font-scale-standard', 'font-scale-large', 'font-scale-xlarge');
      document.documentElement.classList.add(`font-scale-${scale}`);
    }
  }
}
