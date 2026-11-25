// ui-guard-allow: page-frame - standalone Help & Support FAQ page without portal shell
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ButtonComponent,
  IconComponent,
  FormInputComponent,
  FormSelectComponent,
  FormTextareaComponent,
  FormFileUploadComponent
} from '../../shared';
import { AuthService } from '../../core/auth/auth.service';
import { OtrFormService } from '../registration/services/otr-form.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import { FileDoc } from '../registration/models/otr-form.model';
import { Grievance, AdminGrievance } from '../grievance/grievance.shared';
import { GrievanceIssueType } from '../../core/models/grievance.model';

export interface EssentialFaq {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-help-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    FormInputComponent,
    FormSelectComponent,
    FormTextareaComponent,
    FormFileUploadComponent
  ],
  host: {
    class: 'block w-full min-h-screen bg-slate-50 font-sans text-slate-800'
  },
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 selection:bg-[#7C0E44] selection:text-white">
      
      <!-- ====================================================================
           1. TOP APPLICATION HEADER WITH ISMS BRANDING & BACK TO HOME
           ==================================================================== -->
      <header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <!-- Emblem & ISMS Branding -->
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <a routerLink="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer" title="Go to ISMS 2.0 Home">
              <img
                src="/Rajasthan-Sarkar.png"
                alt="Government of Rajasthan Emblem"
                class="h-9 sm:h-10 w-auto object-contain"
                loading="lazy"
              />
              <img
                src="/rsldc-logo.png"
                alt="RSLDC Logo"
                class="h-8 sm:h-9 w-auto object-contain hidden xs:block"
                loading="lazy"
              />
            </a>

            <div class="h-7 w-px bg-slate-200 hidden sm:block"></div>

            <div class="flex flex-col min-w-0">
              <span class="text-sm sm:text-base font-extrabold text-[#7C0E44] tracking-tight leading-tight">ISMS 2.0</span>
              <span class="text-[11px] sm:text-xs text-slate-500 truncate leading-tight">
                Rajasthan Skill and Livelihoods Development Corporation
              </span>
            </div>
          </div>

          <!-- Navigation: One Back to Home Button -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              appButton
              variant="outline"
              size="sm"
              type="button"
              (click)="goHome()"
              aria-label="Back to Home"
            >
              <span>Back to Home</span>
            </button>
          </div>

        </div>
      </header>

      <!-- ====================================================================
           2. BREADCRUMB & PAGE TITLE
           ==================================================================== -->
      <div class="border-b border-slate-200 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <a routerLink="/" class="hover:text-[#7C0E44] transition-colors cursor-pointer">Home</a>
            <span class="text-slate-400">/</span>
            <span class="text-slate-800 font-medium" aria-current="page">Help &amp; Support</span>
          </nav>

          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
            Help &amp; Support
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 m-0 mt-0.5">
            Find answers to common questions or submit a support request.
          </p>
        </div>
      </div>

      <!-- ====================================================================
           3. TWO-COLUMN MAIN CONTENT (Desktop 45% Left / 55% Right)
           ==================================================================== -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT COLUMN (~45% / 5 cols): Contact Helpdesk + Submit Form -->
          <section class="lg:col-span-5 flex flex-col gap-5">
            
            <!-- Left Upper: Contact Helpdesk -->
            <div class="bg-white border border-[#EADCE2] rounded-lg p-5 shadow-2xs">
              <h2 class="text-base font-semibold text-slate-900 m-0 pb-3 border-b border-[#EADCE2]">
                Contact Helpdesk
              </h2>

              <div class="mt-4 space-y-3.5 text-xs sm:text-[13px]">
                <!-- Helpline -->
                <div class="flex items-start gap-2.5">
                  <div class="w-7 h-7 rounded bg-[#FCF8FA] border border-[#EADCE2] flex items-center justify-center text-[#7C0E44] shrink-0 mt-0.5">
                    <app-icon name="phone" size="xs" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Helpline</span>
                    <a href="tel:01412716091" class="text-sm font-semibold text-[#7C0E44] hover:underline" aria-label="Call Helpline 0141-2716091">
                      0141-2716091
                    </a>
                  </div>
                </div>

                <!-- General Helpdesk -->
                <div class="flex items-start gap-2.5">
                  <div class="w-7 h-7 rounded bg-[#FCF8FA] border border-[#EADCE2] flex items-center justify-center text-[#7C0E44] shrink-0 mt-0.5">
                    <app-icon name="phone" size="xs" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">General Helpdesk</span>
                    <a href="tel:01412792600" class="text-sm font-semibold text-[#7C0E44] hover:underline" aria-label="Call General Helpdesk 0141-2792600">
                      0141-2792600
                    </a>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-start gap-2.5">
                  <div class="w-7 h-7 rounded bg-[#FCF8FA] border border-[#EADCE2] flex items-center justify-center text-[#7C0E44] shrink-0 mt-0.5">
                    <app-icon name="mail" size="xs" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Email</span>
                    <a href="mailto:support@isms.rajasthan.gov.in" class="text-sm font-semibold text-[#7C0E44] hover:underline break-all" aria-label="Email support@isms.rajasthan.gov.in">
                      support@isms.rajasthan.gov.in
                    </a>
                  </div>
                </div>

                <!-- Working Hours -->
                <div class="flex items-start gap-2.5">
                  <div class="w-7 h-7 rounded bg-[#FCF8FA] border border-[#EADCE2] flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                    <app-icon name="clock" size="xs" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Working Hours</span>
                    <span class="text-xs sm:text-[13px] text-slate-700 font-medium">Monday to Friday, 9:30 AM – 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Left Lower: Submit a Query / Complaint Form -->
            <div class="bg-white border border-[#EADCE2] rounded-lg p-5 shadow-2xs">
              <div class="pb-3 border-b border-[#EADCE2]">
                <h2 class="text-base font-semibold text-slate-900 m-0">
                  Submit a Query / Complaint
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Provide your details and briefly describe the issue.
                </p>
              </div>

              <!-- Inline Success Confirmation -->
              @if (submittedRefNumber()) {
                <div
                  class="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-fade-in"
                  role="alert"
                  aria-live="polite"
                >
                  <div class="flex items-center gap-2">
                    <app-icon name="check-circle" size="sm" class="text-emerald-700 shrink-0" />
                    <span class="font-semibold text-sm">Your support request has been submitted successfully.</span>
                  </div>
                  <p class="text-xs text-emerald-800 m-0">
                    Reference Number: <strong class="font-bold tracking-wide">{{ submittedRefNumber() }}</strong>
                  </p>
                  <p class="text-xs text-emerald-700 m-0">
                    Please retain this reference number for future communication.
                  </p>
                  <div class="pt-2">
                    <button
                      appButton
                      variant="outline"
                      size="sm"
                      type="button"
                      (click)="resetForm()"
                    >
                      <span>Submit Another Request</span>
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Form Inputs -->
                <form (ngSubmit)="onSubmit()" class="mt-4 space-y-3.5" novalidate>
                  
                  <!-- Failure Notice -->
                  @if (submissionError()) {
                    <div class="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2" role="alert">
                      <app-icon name="error" size="xs" class="text-rose-600 shrink-0" />
                      <span>{{ submissionError() }}</span>
                    </div>
                  }

                  <!-- Full Name & Mobile Number (2-Column Grid) -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <app-form-input
                      id="fullName"
                      label="Full Name"
                      placeholder="Enter full name"
                      [required]="true"
                      [value]="fullName()"
                      (valueChange)="fullName.set($event); onFieldChange('fullName')"
                      [error]="getFieldError('fullName')"
                      [maxLength]="100"
                    />

                    <app-form-input
                      id="mobileNumber"
                      label="Mobile Number"
                      type="tel"
                      placeholder="10-digit mobile"
                      [required]="true"
                      [value]="mobileNumber()"
                      (valueChange)="mobileNumber.set($event); onFieldChange('mobileNumber')"
                      [error]="getFieldError('mobileNumber')"
                      [maxLength]="10"
                    />
                  </div>

                  <!-- Email Address (Full Width, Optional) -->
                  <app-form-input
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="e.g. name@example.com (Optional)"
                    [required]="false"
                    [value]="email()"
                    (valueChange)="email.set($event); onFieldChange('email')"
                    [error]="getFieldError('email')"
                    [maxLength]="100"
                  />

                  <!-- Request Type (Full Width) -->
                  <app-form-select
                    id="requestType"
                    label="Request Type"
                    placeholder="Select request type"
                    [required]="true"
                    [options]="requestTypeOptions"
                    [value]="requestType()"
                    (valueChange)="requestType.set($event); onFieldChange('requestType')"
                    [error]="getFieldError('requestType')"
                  />

                  <!-- Description (Full Width, 10-1000 Chars) -->
                  <app-form-textarea
                    id="description"
                    label="Description"
                    placeholder="Describe your issue or query (10 to 1000 characters)..."
                    [required]="true"
                    [value]="description()"
                    (valueChange)="description.set($event); onFieldChange('description')"
                    [error]="getFieldError('description')"
                    [maxLength]="1000"
                    [showCharCount]="true"
                  />

                  <!-- Attachment (Full Width, Max 5MB) -->
                  <app-form-file-upload
                    label="Attachment"
                    [fileDoc]="attachmentFileDoc()"
                    accept=".pdf,.jpg,.jpeg,.png"
                    [maxSizeMb]="5"
                    hint="Optional (PDF, JPG, JPEG, PNG • Max 5 MB)"
                    [error]="attachmentError()"
                    (fileChange)="onAttachmentChange($event)"
                  />

                  <!-- Submit Action Button -->
                  <div class="pt-1">
                    <button
                      appButton
                      variant="primary"
                      block
                      type="submit"
                      [disabled]="isSubmitting()"
                      class="justify-center"
                    >
                      @if (isSubmitting()) {
                        <app-icon name="spinner" size="xs" class="animate-spin mr-1.5" />
                        <span>Submitting...</span>
                      } @else {
                        <span>Submit Request</span>
                      }
                    </button>
                  </div>

                </form>
              }
            </div>

          </section>

          <!-- RIGHT COLUMN (~55% / 7 cols): Frequently Asked Questions Accordion -->
          <section class="lg:col-span-7">
            <div class="bg-white border border-[#EADCE2] rounded-lg p-5 shadow-2xs">
              <div class="pb-3 border-b border-[#EADCE2]">
                <h2 class="text-base font-semibold text-slate-900 m-0">
                  Frequently Asked Questions
                </h2>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Essential questions regarding portal login, registration, schemes, and applications.
                </p>
              </div>

              <!-- 5 Official FAQs in Accordion with Thin Neutral Separators -->
              <div class="divide-y divide-[#EADCE2] border-b border-[#EADCE2]">
                @for (faq of faqs; track faq.id) {
                  <div>
                    <button
                      appButton
                      variant="ghost"
                      block
                      type="button"
                      (click)="toggleFaq(faq.id)"
                      [attr.aria-expanded]="expandedFaqId() === faq.id"
                      [attr.aria-controls]="'faq-answer-' + faq.id"
                      [id]="'faq-question-' + faq.id"
                      class="justify-between text-left h-auto font-normal"
                    >
                      <span
                        class="text-xs sm:text-[13.5px] leading-snug pr-3 py-1.5 select-none"
                        [class.font-semibold]="expandedFaqId() === faq.id"
                        [class.text-[#7C0E44]]="expandedFaqId() === faq.id"
                      >
                        {{ faq.question }}
                      </span>

                      <app-icon
                        [name]="expandedFaqId() === faq.id ? 'chevron-up' : 'chevron-down'"
                        size="xs"
                        class="shrink-0 transition-transform duration-150"
                        [class.text-[#7C0E44]]="expandedFaqId() === faq.id"
                      />
                    </button>

                    @if (expandedFaqId() === faq.id) {
                      <div
                        [id]="'faq-answer-' + faq.id"
                        [attr.aria-labelledby]="'faq-question-' + faq.id"
                        role="region"
                        class="pb-4 pt-1 px-1 text-xs sm:text-[13px] leading-relaxed text-slate-600 animate-fade-in"
                      >
                        {{ faq.answer }}
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </section>

        </div>
      </main>

      <!-- ====================================================================
           4. GOVERNMENT APPLICATION COMMON FOOTER
           ==================================================================== -->
      <footer class="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; Government of Rajasthan. All rights reserved. | ISMS 2.0</span>
          <div class="flex items-center gap-3">
            <button appButton variant="ghost" size="xs" type="button" (click)="goHome()">
              <span>Home</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class HelpSupportComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private otrService = inject(OtrFormService);
  private dataEngine = inject(DataEngineService);

  private readonly grievanceRepo = this.dataEngine.for<Grievance>('GRIEVANCES');
  private readonly adminGrievanceRepo = this.dataEngine.for<AdminGrievance>('ADMIN_GRIEVANCES');

  // =========================================================================
  // 1. FIVE ESSENTIAL FAQS (Collapsed by default, single expanded at a time)
  // =========================================================================
  readonly faqs: EssentialFaq[] = [
    {
      id: 'faq-1',
      question: 'How do I log in to the ISMS 2.0 portal?',
      answer: 'Users can access the portal using their registered Rajasthan Single Sign-On (SSO) credentials. Complete any additional verification required for the respective user role.'
    },
    {
      id: 'faq-2',
      question: 'How do I complete One-Time Registration (OTR)?',
      answer: 'Log in to the portal, open One-Time Registration and complete the organization details, authorized signatory details, bank details and mandatory undertakings. Submit the registration after completing all required fields.'
    },
    {
      id: 'faq-3',
      question: 'How can I apply for an EOI or scheme?',
      answer: 'Log in using your registered account, navigate to the available EOI or scheme section, review the eligibility requirements, complete the application and upload the required documents before submission.'
    },
    {
      id: 'faq-4',
      question: 'How can I check my application status?',
      answer: 'Log in to your registered account and navigate to the relevant application or proposal section to view its current status and any remarks provided by the department.'
    },
    {
      id: 'faq-5',
      question: 'What should I do if I face a technical issue?',
      answer: 'Contact the official helpdesk or submit a support request using the form available on this page. Provide a clear description of the issue and attach supporting screenshots if required.'
    }
  ];

  readonly expandedFaqId = signal<string | null>(null);

  toggleFaq(id: string): void {
    this.expandedFaqId.update(current => (current === id ? null : id));
  }

  // =========================================================================
  // 2. QUERY / COMPLAINT FORM STATE
  // =========================================================================
  readonly fullName = signal<string>('');
  readonly mobileNumber = signal<string>('');
  readonly email = signal<string>('');
  readonly requestType = signal<string>('');
  readonly description = signal<string>('');
  readonly attachmentFileDoc = signal<FileDoc | null>(null);
  readonly attachmentError = signal<string>('');

  readonly touchedFields = signal<Record<string, boolean>>({});
  readonly isSubmitted = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly submittedRefNumber = signal<string | null>(null);
  readonly submissionError = signal<string | null>(null);

  readonly requestTypeOptions: string[] = [
    'General Query',
    'Login / Registration Issue',
    'EOI / Application Issue',
    'Document / Verification Issue',
    'Technical Issue',
    'Complaint / Grievance',
    'Other'
  ];

  ngOnInit(): void {
    this.prefillUserInfo();
  }

  prefillUserInfo(): void {
    const user = this.authService.currentUser();
    if (user) {
      const otr = this.otrService.formData();
      const prefillName = otr?.step3?.name || otr?.step1?.fullName || (user.label !== 'New User' ? user.label : '') || '';
      const prefillMobile = otr?.step3?.mobileNo || otr?.step1?.contactNo || '';
      const prefillEmail = otr?.step3?.emailId || otr?.step1?.emailId || '';

      if (prefillName && !this.fullName()) this.fullName.set(prefillName);
      if (prefillMobile && !this.mobileNumber()) this.mobileNumber.set(prefillMobile);
      if (prefillEmail && !this.email()) this.email.set(prefillEmail);
    }
  }

  onFieldChange(field: string): void {
    this.touchedFields.update(curr => ({ ...curr, [field]: true }));
  }

  onAttachmentChange(doc: FileDoc | null): void {
    if (doc) {
      const ext = doc.fileName.split('.').pop()?.toLowerCase() || '';
      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        this.attachmentError.set('Only PDF, JPG, JPEG, and PNG files are allowed.');
        this.attachmentFileDoc.set(null);
        return;
      }
    }
    this.attachmentFileDoc.set(doc);
    this.attachmentError.set('');
  }

  // =========================================================================
  // 3. FIELD VALIDATIONS
  // =========================================================================
  validateFullName(): string {
    const val = this.fullName().trim();
    if (!val) return 'Full Name is required.';
    if (val.length < 2 || val.length > 100) return 'Full Name must be between 2 and 100 characters.';
    if (!/^[\p{L}\s.'\-]+$/u.test(val)) return 'Full Name contains invalid characters.';
    return '';
  }

  validateMobile(): string {
    const val = this.mobileNumber().trim();
    if (!val) return 'Mobile Number is required.';
    if (!/^[6-9]\d{9}$/.test(val)) return 'Enter a valid 10-digit Indian mobile number.';
    return '';
  }

  validateEmail(): string {
    const val = this.email().trim();
    if (!val) return '';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
      return 'Enter a valid email address.';
    }
    return '';
  }

  validateRequestType(): string {
    const val = this.requestType().trim();
    if (!val) return 'Please select a request type.';
    if (!this.requestTypeOptions.includes(val)) return 'Please select a valid request type.';
    return '';
  }

  validateDescription(): string {
    const val = this.description().trim();
    if (!val) return 'Description is required.';
    if (val.length < 10) return 'Description must be at least 10 characters.';
    if (val.length > 1000) return 'Description cannot exceed 1000 characters.';
    return '';
  }

  getFieldError(field: string): string {
    if (!this.isSubmitted() && !this.touchedFields()[field]) {
      return '';
    }
    switch (field) {
      case 'fullName':
        return this.validateFullName();
      case 'mobileNumber':
        return this.validateMobile();
      case 'email':
        return this.validateEmail();
      case 'requestType':
        return this.validateRequestType();
      case 'description':
        return this.validateDescription();
      default:
        return '';
    }
  }

  isFormValid(): boolean {
    return (
      !this.validateFullName() &&
      !this.validateMobile() &&
      !this.validateEmail() &&
      !this.validateRequestType() &&
      !this.validateDescription() &&
      !this.attachmentError()
    );
  }

  focusFirstInvalid(): void {
    if (typeof document === 'undefined') return;
    const errorFieldIds = ['fullName', 'mobileNumber', 'email', 'requestType', 'description'];
    for (const id of errorFieldIds) {
      if (this.getFieldError(id)) {
        const el = document.getElementById(id) || document.querySelector(`[id*="${id}"]`);
        if (el && 'focus' in el) {
          (el as HTMLElement).focus();
          break;
        }
      }
    }
  }

  // =========================================================================
  // 4. SUBMISSION WORKFLOW & DATA PERSISTENCE
  // =========================================================================
  onSubmit(): void {
    this.isSubmitted.set(true);
    this.submissionError.set(null);

    if (!this.isFormValid()) {
      this.focusFirstInvalid();
      return;
    }

    this.isSubmitting.set(true);

    const refNum = `ISMS-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const mappedIssueType: GrievanceIssueType =
      this.requestType() === 'Technical Issue' ||
      this.requestType() === 'Login / Registration Issue' ||
      this.requestType() === 'Complaint / Grievance'
        ? 'Technical'
        : 'Enquire';

    const user = this.authService.currentUser();
    const ssoId = user?.ssoId || 'guest';
    const emailStr = this.email().trim() ? ` | Email: ${this.email().trim()}` : '';
    const fullDesc = `[Requester: ${this.fullName().trim()} | Mobile: ${this.mobileNumber().trim()}${emailStr} | SSO: ${ssoId}]\n\n${this.description().trim()}`;

    const grievanceRecord: Partial<Grievance> = {
      title: `[${refNum}] ${this.requestType()}`,
      schemeName: 'General / Support Request',
      description: fullDesc,
      issueType: mappedIssueType,
      attachment: this.attachmentFileDoc()?.fileName || 'None',
      status: 'Open',
      submittedAt: new Date().toISOString()
    };

    const adminRecord: Partial<AdminGrievance> = {
      ...grievanceRecord,
      userName: this.fullName().trim()
    };

    forkJoin([
      this.grievanceRepo.create(grievanceRecord),
      this.adminGrievanceRepo.create(adminRecord)
    ])
      .pipe(
        catchError(() => {
          this.submissionError.set('Unable to submit your request. Please try again.');
          this.isSubmitting.set(false);
          return of(null);
        })
      )
      .subscribe(res => {
        if (res) {
          this.isSubmitting.set(false);
          this.submittedRefNumber.set(refNum);
          this.clearFormFields();
        }
      });
  }

  resetForm(): void {
    this.submittedRefNumber.set(null);
    this.submissionError.set(null);
    this.isSubmitted.set(false);
    this.touchedFields.set({});
    this.clearFormFields();
    this.prefillUserInfo();
  }

  clearFormFields(): void {
    this.fullName.set('');
    this.mobileNumber.set('');
    this.email.set('');
    this.requestType.set('');
    this.description.set('');
    this.attachmentFileDoc.set(null);
    this.attachmentError.set('');
  }

  // =========================================================================
  // 5. NAVIGATION
  // =========================================================================
  goHome(): void {
    this.router.navigate(['/']);
  }
}
