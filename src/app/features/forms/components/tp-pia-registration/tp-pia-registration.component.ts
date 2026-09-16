import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  TpPiaRegistrationService,
  INDIAN_STATES,
  RAJASTHAN_DISTRICTS,
  BUSINESS_ACTIVITIES,
  COMMON_BANKS,
  TRANSFER_MODES,
  ACCOUNT_TYPES,
  ID_PROOF_TYPES
} from '../../services/tp-pia-registration.service';
import { FormValidationService } from '../../services/form-validation.service';
import {
  TpPiaRegistrationData,
  UploadedDocument
} from '../../models/tp-pia-registration.model';
import { SearchableDropdownComponent } from '../searchable-dropdown/searchable-dropdown.component';
import {
  formatDateDisplay,
  getIsoDate,
  onlyLetters,
  onlyNumbers,
  onlyAlphanumeric,
  onlyAlphanumericSymbols,
  onlyLettersSymbols,
  onlyDecimals,
  sanitizeLetters,
  sanitizeNumbers,
  sanitizeAlphanumericUpper,
  sanitizeAlphanumericSymbols,
  sanitizeAlphanumericSymbolsUpper,
  sanitizeLettersSymbolsUpper,
  sanitizeDecimals,
  getDateBounds
} from '../../utils/form-input-restrictions';
import {
  FormFieldConfig,
  FormSectionConfig,
  STEP_1_SECTIONS,
  STEP_2_SECTIONS,
  STEP_3_SECTIONS
} from '../../models/tp-pia-form-schema';

export interface TabItem {
  id: number;
  label: string;
  shortLabel: string;
  icon: string;
}

export const REGISTRATION_TABS: TabItem[] = [
  { id: 1, label: 'Organisation Details', shortLabel: 'Organisation', icon: '🏢' },
  { id: 2, label: 'Auth Person (Org)', shortLabel: 'Auth (Org)', icon: '✍️' },
  { id: 3, label: 'Bank Details', shortLabel: 'Bank Details', icon: '🏦' },
  { id: 4, label: 'Document Upload', shortLabel: 'Documents', icon: '📁' },
  { id: 5, label: 'Review & Submit', shortLabel: 'Review', icon: '📋' },
];

@Component({
  selector: 'app-tp-pia-registration',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent],
  templateUrl: './tp-pia-registration.component.html',
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .step-content-smooth { animation: fadeIn 0.2s ease-in-out; }
    input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; appearance: textfield; }
  `]
})
export class TpPiaRegistrationComponent implements OnInit {
  readonly service = inject(TpPiaRegistrationService);
  readonly valService = inject(FormValidationService);

  // --- STEPPER STATE ---
  readonly activeTab = signal<number>(1);
  readonly showSuccessModal = signal<boolean>(false);
  readonly fontScale = signal<'standard' | 'large' | 'xlarge'>('standard');
  declarationAgreed: boolean = false;

  readonly tabs: TabItem[] = REGISTRATION_TABS;

  // --- SCHEMA CONFIGS ---
  readonly step1Sections = STEP_1_SECTIONS;
  readonly step2Sections = STEP_2_SECTIONS;
  readonly step3Sections = STEP_3_SECTIONS;

  get currentStepSections(): FormSectionConfig[] {
    switch (this.activeTab()) {
      case 1: return this.step1Sections;
      case 2: return this.step2Sections;
      case 3: return this.step3Sections;
      default: return [];
    }
  }

  // --- STATIC OPTIONS ---
  readonly states = INDIAN_STATES;
  readonly districts = RAJASTHAN_DISTRICTS;
  readonly businessActivities = BUSINESS_ACTIVITIES;
  readonly commonBanks = COMMON_BANKS;
  readonly transferModes = TRANSFER_MODES;
  readonly accountTypes = ACCOUNT_TYPES;
  readonly idTypes = ID_PROOF_TYPES.filter((t: string) => t !== 'Aadhaar Card' && t !== 'PAN Card');

  // --- STABLE DATE BOUNDS ---
  readonly dateBounds = getDateBounds();
  readonly todayIso = this.dateBounds.todayIso;
  readonly maxDobIso = this.dateBounds.maxDobIso;
  readonly minDobIso = this.dateBounds.minDobIso;

  // --- EXPOSE UTILS TO TEMPLATE ---
  readonly formatDateDisplay = formatDateDisplay;
  readonly getIsoDate = getIsoDate;
  readonly onlyLetters = onlyLetters;
  readonly onlyNumbers = onlyNumbers;
  readonly onlyAlphanumeric = onlyAlphanumeric;
  readonly onlyAlphanumericSymbols = onlyAlphanumericSymbols;
  readonly onlyLettersSymbols = onlyLettersSymbols;
  readonly onlyDecimals = onlyDecimals;
  readonly sanitizeLetters = sanitizeLetters;
  readonly sanitizeNumbers = sanitizeNumbers;
  readonly sanitizeAlphanumericUpper = sanitizeAlphanumericUpper;
  readonly sanitizeAlphanumericSymbols = sanitizeAlphanumericSymbols;
  readonly sanitizeAlphanumericSymbolsUpper = sanitizeAlphanumericSymbolsUpper;
  readonly sanitizeLettersSymbolsUpper = sanitizeLettersSymbolsUpper;
  readonly sanitizeDecimals = sanitizeDecimals;

  // --- STEP 3 BANK FILE STATE ---
  readonly isBankDragging = signal<boolean>(false);
  readonly bankFileError = signal<string>('');

  // --- STEP 4 DOCUMENT STATE ---
  readonly docErrorMessage = signal<string>('');
  readonly previewingDoc = signal<UploadedDocument | null>(null);

  // --- STEP 5 REVIEW ACCORDION STATES ---
  readonly isReviewStep1Open = signal<boolean>(true);
  readonly isReviewAuthPersonOpen = signal<boolean>(false);
  readonly isReviewBankOpen = signal<boolean>(false);
  readonly isReviewDocsOpen = signal<boolean>(false);

  // --- DATA ACCESSOR ---
  get data(): TpPiaRegistrationData {
    return this.service.formData();
  }

  get documents(): UploadedDocument[] {
    return this.data.documents;
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

  // --- VALIDATION COMPUTATION ---
  readonly errors = computed(() => {
    const data = this.service.formData();
    return {
      ...this.valService.validateTab1(data).errors,
      ...this.valService.validateTab2(data).errors,
      ...this.valService.validateTab3(data).errors,
      ...this.valService.validateTab4(data).errors,
    };
  });

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

  ngOnInit() {
    this.service.restoreSavedDraft();
    if (!this.data.basicInfo.applicationNo) {
      this.service.updateFormData(curr => ({
        ...curr,
        basicInfo: {
          ...curr.basicInfo,
          applicationNo: this.service.generateApplicationNo()
        }
      }));
    }
  }

  // --- DEBOUNCED FORM UPDATE ---
  private changeTimer: any;
  onDataChange() {
    if (this.changeTimer) clearTimeout(this.changeTimer);
    this.changeTimer = setTimeout(() => {
      this.service.updateFormData(curr => ({ ...curr }));
    }, 60);
  }

  // --- GENERIC FIELD ACCESSORS & SCHEMA HELPERS ---
  getFieldValue(path: string): any {
    const parts = path.split('.');
    let obj: any = this.data;
    for (const p of parts) {
      if (obj === undefined || obj === null) return '';
      obj = obj[p];
    }
    return obj ?? '';
  }

  setFieldValue(path: string, value: any): void {
    const parts = path.split('.');
    let obj: any = this.data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;

    if (path.startsWith('registeredAddress') && this.data.sameAsRegistered) {
      this.toggleSameAddress();
    }
    this.onDataChange();
  }

  getFieldLength(field: FormFieldConfig): number {
    const val = this.getFieldValue(field.key);
    return val ? String(val).length : 0;
  }

  getDateBound(maxDateKey?: 'todayIso' | 'maxDobIso'): string {
    if (maxDateKey === 'todayIso') return this.todayIso;
    if (maxDateKey === 'maxDobIso') return this.maxDobIso;
    return this.todayIso;
  }

  getSearchableOptions(key?: 'states' | 'rajasthanDistricts' | 'banks'): string[] {
    if (key === 'states') return this.states;
    if (key === 'rajasthanDistricts') return this.districts;
    if (key === 'banks') return this.commonBanks;
    return [];
  }

  onFieldKeypress(field: FormFieldConfig, event: KeyboardEvent): boolean {
    switch (field.restriction) {
      case 'alpha-hyphen-slash':
      case 'alphanumeric-symbols':
        return onlyAlphanumericSymbols(event);
      case 'alphanumeric':
      case 'alphanumeric-upper':
        return onlyAlphanumeric(event);
      case 'alpha-space':
        return onlyLetters(event);
      case 'digits':
        return onlyNumbers(event);
      case 'decimal':
        return onlyDecimals(event, this.getFieldValue(field.key));
      case 'pan':
      case 'cin':
      case 'gst':
      case 'ifsc':
        return onlyAlphanumeric(event);
      default:
        return true;
    }
  }

  handleFieldInput(field: FormFieldConfig, event: any): void {
    let val = event.target ? event.target.value : event;
    const max = field.maxlength;
    switch (field.restriction) {
      case 'alpha-hyphen-slash':
      case 'alphanumeric-symbols':
        val = sanitizeAlphanumericSymbols(val, max);
        break;
      case 'alphanumeric':
      case 'alphanumeric-upper':
        val = sanitizeAlphanumericUpper(val, max);
        break;
      case 'alpha-space':
        val = sanitizeLetters(val, max);
        break;
      case 'digits':
        val = sanitizeNumbers(val, max);
        break;
      case 'decimal':
        val = sanitizeDecimals(val, max || 10);
        break;
      case 'pan':
        val = sanitizeAlphanumericUpper(val, 10);
        break;
      case 'cin':
        val = sanitizeAlphanumericUpper(val, 21);
        break;
      case 'gst':
        val = sanitizeAlphanumericUpper(val, 15);
        break;
      case 'ifsc':
        val = sanitizeAlphanumericUpper(val, 11);
        break;
      default:
        if (field.uppercase) {
          val = String(val ?? '').toUpperCase();
        }
        if (max && typeof val === 'string') {
          val = val.slice(0, max);
        }
        break;
    }
    this.setFieldValue(field.key, val);
  }

  onFieldChange(field: FormFieldConfig): void {
    this.onDataChange();
  }

  onDateChange(field: FormFieldConfig): void {
    if (field.key === 'authorizedOrg.dob') {
      this.onDobChange();
    } else {
      this.onDataChange();
    }
  }

  // --- FIELD VALIDATION HELPERS ---
  isFieldInvalid(fieldKey: string): boolean {
    const error = this.errors()[fieldKey];
    if (!error) return false;

    const parts = fieldKey.split('.');
    let curr: any = this.data;
    for (const part of parts) {
      if (curr === undefined || curr === null) return false;
      curr = curr[part];
    }
    const hasValue = curr !== undefined && curr !== null && String(curr).trim().length > 0;
    if (hasValue) return true;

    if (fieldKey.startsWith('basicInfo') || fieldKey.startsWith('entityInfo') || fieldKey.startsWith('registeredAddress') || fieldKey.startsWith('postalAddress')) {
      return this.valService.isTabSubmitted(1);
    }
    if (fieldKey.startsWith('authorizedOrg')) {
      return this.valService.isTabSubmitted(2);
    }
    if (fieldKey.startsWith('bankDetails')) {
      return this.valService.isTabSubmitted(3);
    }
    return this.valService.isTabSubmitted(this.activeTab());
  }

  getFieldError(fieldKey: string): string {
    return this.isFieldInvalid(fieldKey) ? (this.errors()[fieldKey] || '') : '';
  }

  // --- ADDRESS SYNC ---
  toggleSameAddress() {
    if (this.data.sameAsRegistered) {
      const reg = this.data.registeredAddress;
      const full = [reg.address, reg.district, reg.state, reg.pincode ? `PIN: ${reg.pincode}` : ''].filter(Boolean).join(', ');
      this.data.postalAddress.address = full;
      this.data.postalAddress.state = 'Rajasthan';
      this.data.postalAddress.district = reg.district;
      this.data.postalAddress.pincode = reg.pincode;
    }
    this.service.updateFormData(curr => ({ ...curr }));
  }

  // --- DOB / AGE COMPUTATION ---
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

  // --- STEP 3: Bank Dropdown & Cheque File ---
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
    const maxBytes = 5 * 1024 * 1024;

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

  // --- STEP 4: Document Upload & Removal ---
  onDocFileSelected(event: Event, docId: string) {
    this.docErrorMessage.set('');
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxBytes = 5 * 1024 * 1024;

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

  // --- STEPPER NAVIGATION & FORM ACTIONS ---
  private scrollToTop() {
    if (typeof document !== 'undefined') {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

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
    const current = this.activeTab();
    if (this.valService.isTabValid(current, this.data)) {
      this.valService.markTabCompleted(current);
    }
    this.service.saveDraftSync();
    this.activeTab.set(tabId);
    this.valService.clearToast();
    this.scrollToTop();
    this.scrollStepIntoView(tabId);
  }

  nextTab() {
    const current = this.activeTab();
    this.valService.markTabSubmitted(current);

    if (current <= 4 && !this.valService.isTabValid(current, this.data)) {
      const tabName = this.tabs[current - 1]?.label || `Tab ${current}`;
      this.valService.showToast(`Please fill all required fields correctly in "${tabName}" before proceeding.`);
      this.scrollToTop();
      return;
    }

    this.valService.markTabCompleted(current);
    this.valService.clearToast();
    this.service.saveDraftSync();
    if (current < 5) {
      const nextId = current + 1;
      this.activeTab.set(nextId);
      this.scrollToTop();
      this.scrollStepIntoView(nextId);
    }
  }

  prevTab() {
    if (this.activeTab() > 1) {
      this.service.saveDraftSync();
      const prevId = this.activeTab() - 1;
      this.activeTab.set(prevId);
      this.valService.clearToast();
      this.scrollToTop();
      this.scrollStepIntoView(prevId);
    }
  }

  resetForm() {
    this.service.resetForm();
    this.valService.resetSubmitted();
    this.activeTab.set(1);
    this.declarationAgreed = false;
    this.valService.clearToast();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveAsDraft() {
    this.service.saveDraftSync();
    this.valService.showToast('Application draft saved successfully.', 'success');
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

  printAcknowledgement() {
    window.print();
  }
}
