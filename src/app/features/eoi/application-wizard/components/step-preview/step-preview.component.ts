import { Component, Input, Output, EventEmitter, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../services/eoi.service';
import { Scheme } from '../../../../../core/services/eoi-state.service';
import { RAJASTHAN_DISTRICTS } from '../../models/eoi.model';
import { PreviewFieldComponent } from '../shared/preview-field.component';
import { FormFieldComponent } from '../shared/form-field.component';

@Component({
  selector: 'app-step-preview',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DecimalPipe, 
    PreviewFieldComponent, 
    FormFieldComponent
  ],
  styleUrls: ['../../application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- FULL PREVIEW MODE -->
    <div *ngIf="eoiService.flowStage() === 'preview'" class="gov-step-content" aria-labelledby="step3-heading">
      
      <!-- Page Header & Subtitle -->
      <div class="page-title-section">
        <div class="title-header-row">
          <div class="title-meta-left">
            <h1 id="step3-heading" class="section-title">EOI Application Preview</h1>
            <p class="section-subtitle">Complete Official Field Summary • Review All Sections Before Final Submission</p>
          </div>
          <div class="title-meta-right">
            <span class="gov-step-pill">STEP 03 OF 04</span>
            <div class="preview-status-pill">
              <span class="status-dot-green"></span>
              <span>Status: <strong>Ready for Submission</strong></span>
            </div>
          </div>
        </div>
        <div class="title-separator"></div>
      </div>

      <!-- Post-Submission Modification Mode Notice Banner -->
      <div *ngIf="eoiService.isModificationMode()" class="modification-active-alert">
        <div class="mod-alert-content">
          <span class="mod-alert-icon">✏️</span>
          <div class="mod-alert-text">
            <strong>Post-Submission Modification Mode Active: Edit {{ eoiService.modificationCount() + 1 }} of {{ eoiService.maxModifications }}</strong>
            <p>You can edit the complete application details. You have <strong>{{ eoiService.modificationsRemaining() }} edit(s) remaining</strong> out of 3 allowed.</p>
          </div>
        </div>
        <button type="button" class="gov-btn gov-btn-secondary" (click)="eoiService.setFlowStage('documents')">
          📁 Edit Document Uploads &amp; Details
        </button>
      </div>

      <!-- Top Application Summary Strip -->
      <div class="preview-summary-strip">
        <div class="summary-meta-col">
          <span class="meta-label">Application Number:</span>
          <span class="meta-val font-mono">{{ eoiService.formData().orgBasicDetails.application_no }}</span>
        </div>
        <div class="summary-meta-col">
          <span class="meta-label">Training Provider:</span>
          <span class="meta-val">{{ eoiService.formData().orgBasicDetails.tp_full_name }}</span>
        </div>
        <div class="summary-meta-col">
          <span class="meta-label">Application Status:</span>
          <span class="meta-val text-success">Verified &amp; Fee Paid</span>
        </div>
        <div class="summary-meta-col">
          <span class="meta-label">Payment ID:</span>
          <span class="meta-val font-mono">{{ eoiService.paymentData().transactionId || 'TXN-ISMS-2026-884921' }}</span>
        </div>
      </div>

      <!-- SECTION 1: Organisation / Company Basic Details -->
      <div id="preview-sec-1" class="gov-card-section preview-card">
        <div class="gov-card-header preview-card-header">
          <div class="card-title-group">
            <h3 class="card-title">1. Organisation / Company Basic Details (17 Fields)</h3>
          </div>
          <button type="button" class="section-edit-btn" (click)="editSection(1)" title="Edit Organisation Details">
            ✏️ Edit Section
          </button>
        </div>
        <div class="gov-card-body">
          <div class="preview-fields-grid">
            <app-preview-field label="1. Application No." [value]="eoiService.formData().orgBasicDetails.application_no" [isMono]="true"></app-preview-field>
            <app-preview-field label="2. TP/PIA Full Name" [value]="eoiService.formData().orgBasicDetails.tp_full_name" [required]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="3. TP/PIA Short Name" [value]="eoiService.formData().orgBasicDetails.tp_short_name" [required]="true" [isMono]="true"></app-preview-field>
            <app-preview-field label="4. Registration Number" [value]="eoiService.formData().orgBasicDetails.registration_number" [isMono]="true"></app-preview-field>
            <app-preview-field label="5. Organisation Contact No." [value]="eoiService.formData().orgBasicDetails.organisation_contact_no" [required]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="6. Company Email-ID" [value]="eoiService.formData().orgBasicDetails.company_email" [required]="true"></app-preview-field>
            <app-preview-field label="7. Organisation PAN No." [value]="eoiService.formData().orgBasicDetails.organisation_pan" [isMono]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="8. Website" [value]="eoiService.formData().orgBasicDetails.website" [isLink]="true"></app-preview-field>
            <app-preview-field label="9. Registered Address" [value]="eoiService.formData().orgBasicDetails.registered_address" [required]="true" [fullSpan]="true"></app-preview-field>
            <app-preview-field label="10. State / UT" [value]="eoiService.formData().orgBasicDetails.state_ut" [required]="true"></app-preview-field>
            <app-preview-field label="11. District" [value]="eoiService.formData().orgBasicDetails.district" [required]="true"></app-preview-field>
            <app-preview-field label="12. Pincode" [value]="eoiService.formData().orgBasicDetails.pincode" [required]="true" [isMono]="true"></app-preview-field>
            <app-preview-field label="13. Turn Over (₹ in Lakhs)" [value]="'₹ ' + eoiService.formData().orgBasicDetails.turnover_lakhs + ' Lakhs'" [required]="true" [isNavy]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="14. Date of Registration" [value]="eoiService.formData().orgBasicDetails.date_of_registration"></app-preview-field>
            <app-preview-field label="15. State Where Registered" [value]="eoiService.formData().orgBasicDetails.state_where_registered"></app-preview-field>
            <app-preview-field label="16. Type of Business / Activity" [value]="eoiService.formData().orgBasicDetails.type_of_business"></app-preview-field>
            <app-preview-field label="17. Postal / Communication Address" [value]="eoiService.formData().orgBasicDetails.postal_address" [required]="true" [fullSpan]="true"></app-preview-field>
          </div>
        </div>
      </div>

      <!-- SECTION 2: Authorized Person Details -->
      <div id="preview-sec-2" class="gov-card-section preview-card">
        <div class="gov-card-header preview-card-header">
          <div class="card-title-group">
            <h3 class="card-title">2. Authorized Person Details (Organisation Level) (17 Fields)</h3>
          </div>
          <button type="button" class="section-edit-btn" (click)="editSection(2)" title="Edit Authorized Person Details">
            ✏️ Edit Section
          </button>
        </div>
        <div class="gov-card-body">
          <div class="preview-fields-grid">
            <app-preview-field label="1. Name" [value]="eoiService.formData().authPersonDetails.auth_name" [required]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="2. S/O, D/O, W/O" [value]="eoiService.formData().authPersonDetails.auth_guardian_name"></app-preview-field>
            <app-preview-field label="3. Date of Birth" [value]="eoiService.formData().authPersonDetails.auth_dob"></app-preview-field>
            <app-preview-field label="4. Age" [value]="eoiService.formData().authPersonDetails.auth_age ? (eoiService.formData().authPersonDetails.auth_age + ' Years') : ''"></app-preview-field>
            <app-preview-field label="5. Designation" [value]="eoiService.formData().authPersonDetails.auth_designation" [isBold]="true"></app-preview-field>
            <app-preview-field label="6. Mobile No." [value]="eoiService.formData().authPersonDetails.auth_mobile" [required]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="7. Email-Id" [value]="eoiService.formData().authPersonDetails.auth_email"></app-preview-field>
            <app-preview-field label="8. State" [value]="eoiService.formData().authPersonDetails.auth_state"></app-preview-field>
            <app-preview-field label="9. Residence Address" [value]="eoiService.formData().authPersonDetails.auth_residence_address" [fullSpan]="true"></app-preview-field>
            <app-preview-field label="10. PAN" [value]="eoiService.formData().authPersonDetails.auth_pan" [required]="true" [isMono]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="11. Aadhaar No." [value]="eoiService.formData().authPersonDetails.auth_aadhaar" [isMono]="true"></app-preview-field>
            <app-preview-field label="12. Type ID Proof" [value]="eoiService.formData().authPersonDetails.auth_id_proof_type"></app-preview-field>
            <app-preview-field label="13. ID No." [value]="eoiService.formData().authPersonDetails.auth_id_number" [isMono]="true"></app-preview-field>
            <app-preview-field label="14. Bhamashah No." [value]="eoiService.formData().authPersonDetails.auth_bhamashah" [isMono]="true"></app-preview-field>
            <app-preview-field label="15. Voter Id No." [value]="eoiService.formData().authPersonDetails.auth_voter_id" [isMono]="true"></app-preview-field>
            <app-preview-field label="16. Passport No." [value]="eoiService.formData().authPersonDetails.auth_passport_no" [isMono]="true"></app-preview-field>
            <app-preview-field label="17. Service Tax No." [value]="eoiService.formData().authPersonDetails.auth_service_tax_no" [isMono]="true"></app-preview-field>
          </div>
        </div>
      </div>

      <!-- SECTION 3: Bank Details -->
      <div id="preview-sec-3" class="gov-card-section preview-card">
        <div class="gov-card-header preview-card-header">
          <div class="card-title-group">
            <h3 class="card-title">3. Bank Details (9 Fields)</h3>
          </div>
          <button type="button" class="section-edit-btn" (click)="editSection(3)" title="Edit Bank Details">
            ✏️ Edit Section
          </button>
        </div>
        <div class="gov-card-body">
          <div class="preview-fields-grid">
            <app-preview-field label="1. Name of the Bank" [value]="eoiService.formData().bankDetails.bank_name" [required]="true" [isNavy]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="2. Account No." [value]="eoiService.formData().bankDetails.bank_account_no" [required]="true" [isMono]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="3. IFSC Code" [value]="eoiService.formData().bankDetails.bank_ifsc" [required]="true" [isMono]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="4. Type of Account" [value]="eoiService.formData().bankDetails.bank_account_type"></app-preview-field>
            <app-preview-field label="5. Mode of Electronic Transfer" [value]="eoiService.formData().bankDetails.bank_transfer_mode"></app-preview-field>
            <app-preview-field label="6. Branch Name" [value]="eoiService.formData().bankDetails.bank_branch_name" [required]="true"></app-preview-field>
            <app-preview-field label="7. MICR Code" [value]="eoiService.formData().bankDetails.bank_micr" [isMono]="true"></app-preview-field>
            <app-preview-field label="8. Branch Address" [value]="eoiService.formData().bankDetails.bank_branch_address" [required]="true" [fullSpan]="true"></app-preview-field>
            <div class="preview-field-item full-span">
              <span class="p-label">9. Uploaded Cancelled Cheque / Bank Passbook</span>
              <div class="bank-proof-preview-row">
                <span class="p-uploaded-tag">Uploaded • {{ eoiService.formData().bankDetails.bank_cancelled_cheque_doc }} (920 KB)</span>
                <button
                  type="button"
                  class="preview-view-doc-btn"
                  (click)="onViewDoc.emit({ title: 'Cancelled Cheque / Bank Passbook', fileName: eoiService.formData().bankDetails.bank_cancelled_cheque_doc, fileSize: '920 KB' })"
                >
                  View Cheque Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: Fee Payment & Transaction Details -->
      <div id="preview-sec-4" class="gov-card-section preview-card">
        <div class="gov-card-header preview-card-header">
          <div class="card-title-group">
            <h3 class="card-title">4. Fee Payment &amp; Transaction Proof</h3>
          </div>
          <span class="payment-status-badge badge-success">✓ ₹{{ eoiService.computedTotalFee().toLocaleString('en-IN') }} Paid</span>
        </div>
        <div class="gov-card-body">
          <div class="preview-fields-grid">
            <app-preview-field label="Processing Fee (Non-refundable)" [value]="'₹' + ((eoiService.paymentData().processingFee || 2000) | number:'1.0-0') + '.00 (PF-RJ-2026-11029)'" [isBold]="true"></app-preview-field>
            <app-preview-field label="Earnest Money Deposit (EMD)" [value]="'₹' + ((eoiService.paymentData().emdFee || 50000) | number:'1.0-0') + '.00 (EMD-RJ-2026-88492)'" [isBold]="true"></app-preview-field>
            <app-preview-field label="Total Amount Paid" [value]="'₹' + eoiService.computedTotalFee().toLocaleString('en-IN') + '.00'" [isNavy]="true" [isBold]="true" [isMono]="true"></app-preview-field>
            <app-preview-field label="Transaction Reference ID" [value]="eoiService.paymentData().transactionId || 'TXN-ISMS-2026-884921'" [isMono]="true" [isBold]="true"></app-preview-field>
            <app-preview-field label="Payment Method & Date" [value]="(eoiService.paymentData().paymentMethod || 'Online UPI') + ' • ' + (eoiService.paymentData().paymentDate || '08-Sep-2026')"></app-preview-field>
            <app-preview-field label="Payment Gateway Status" value="SUCCESSFUL & VERIFIED" [isSuccess]="true" [isBold]="true"></app-preview-field>
          </div>
        </div>
      </div>

      <!-- SECTION 5: Uploaded Document Checklist -->
      <div id="preview-sec-5" class="gov-card-section preview-card">
        <div class="gov-card-header preview-card-header">
          <div class="card-title-group">
            <h3 class="card-title">5. Official Uploaded Documents Checklist (Sections 1–5 Verification)</h3>
          </div>
        </div>
        <div class="gov-card-body">
          <div class="preview-docs-list">
            <div
              *ngFor="let doc of eoiService.formData().specUploadDocs; let i = index"
              class="preview-doc-item"
              [class.not-uploaded]="!doc.file_name"
            >
              <div class="p-doc-main">
                <span class="p-doc-num">{{ doc.s_no }}</span>
                <div class="p-doc-text">
                  <div class="p-doc-title-row">
                    <span class="p-doc-name">{{ doc.doc_title }}</span>
                  </div>
                  <span class="p-doc-sub">{{ doc.guidelines }}</span>
                </div>
              </div>

              <div class="p-doc-status-col">
                <input
                  type="file"
                  [id]="'preview_file_input_' + doc.s_no"
                  class="hidden-file-input"
                  accept=".pdf,application/pdf"
                  (change)="onPreviewFileSelected(doc.s_no, $event)"
                />

                <span *ngIf="doc.file_name" class="p-uploaded-tag">
                  Uploaded • {{ doc.file_name }} ({{ doc.file_size }})
                </span>
                <span *ngIf="!doc.file_name" class="p-not-uploaded-tag">
                  — Not Uploaded
                </span>
                
                <div class="preview-doc-btn-group">
                  <button
                    *ngIf="doc.file_name"
                    type="button"
                    class="preview-view-doc-btn"
                    (click)="onViewDoc.emit({ title: doc.doc_title, fileName: doc.file_name, fileSize: doc.file_size })"
                    title="View Document"
                  >
                    View
                  </button>

                  <label [attr.for]="'preview_file_input_' + doc.s_no" class="preview-change-doc-btn" title="Change PDF Document">
                    Change
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Preview Actions -->
      <div class="gov-form-footer">
        <div class="footer-left">
          <button
            *ngIf="!eoiService.isModificationMode()"
            type="button"
            class="gov-btn gov-btn-secondary"
            (click)="eoiService.setFlowStage('fees')"
          >
            ← Back to Fees
          </button>
          <button
            *ngIf="eoiService.isModificationMode()"
            type="button"
            class="gov-btn gov-btn-secondary"
            (click)="eoiService.setFlowStage('receipt')"
          >
            ← Cancel &amp; Return to Receipt
          </button>
        </div>
        <div class="footer-right">
          <button
            type="button"
            id="btn-final-submit"
            class="gov-btn gov-btn-submit"
            (click)="onOpenSubmitConfirm.emit()"
          >
            <span *ngIf="!eoiService.isModificationMode()">Submit EOI Application</span>
            <span *ngIf="eoiService.isModificationMode()">Save &amp; Update Application (Edit {{ eoiService.modificationCount() + 1 }} of {{ eoiService.maxModifications }})</span>
            <span class="arrow-icon">✓</span>
          </button>
        </div>
      </div>

    </div>

    <!-- INDIVIDUAL SECTION EDIT VIEW -->
    <div *ngIf="eoiService.flowStage() === 'edit_section'" class="gov-step-content">

      <!-- Section 1 Edit: Organisation Basic Details -->
      <div *ngIf="eoiService.activeEditSectionId() === 1">
        <div class="gov-card-section">
          <div class="gov-card-header">
            <h3 class="card-title">1. Organisation / Company Basic Details (17 Fields)</h3>
          </div>
          <div class="gov-card-body">
            <div *ngIf="hasEditValidationErrors()" class="gov-edit-error-banner">
              <div class="banner-icon">⚠️</div>
              <div class="banner-text">
                <strong>Mandatory Fields Incomplete:</strong> Please fill in all compulsory fields marked with <span class="req-star">*</span> before saving.
              </div>
            </div>

            <div class="gov-form-layout">
              <app-form-field label="TP/PIA Full Name" [required]="true" [maxlength]="150" hint="Max 150 characters" [value]="eoiService.formData().orgBasicDetails.tp_full_name" (valueChange)="eoiService.updateOrgBasicDetails({ tp_full_name: $event }); onClearFieldError.emit('tp_full_name')" [errorMessage]="validationErrors['tp_full_name']"></app-form-field>
              <app-form-field label="TP/PIA Short Name" [required]="true" [maxlength]="50" [value]="eoiService.formData().orgBasicDetails.tp_short_name" (valueChange)="eoiService.updateOrgBasicDetails({ tp_short_name: $event }); onClearFieldError.emit('tp_short_name')" [errorMessage]="validationErrors['tp_short_name']"></app-form-field>
              <app-form-field label="Registration Number" [maxlength]="50" [value]="eoiService.formData().orgBasicDetails.registration_number" (valueChange)="eoiService.updateOrgBasicDetails({ registration_number: $event })"></app-form-field>
              <app-form-field label="Organisation Contact No." type="tel" [required]="true" [maxlength]="10" [value]="eoiService.formData().orgBasicDetails.organisation_contact_no" (valueChange)="eoiService.updateOrgBasicDetails({ organisation_contact_no: $event }); onClearFieldError.emit('organisation_contact_no')" [errorMessage]="validationErrors['organisation_contact_no']"></app-form-field>
              <app-form-field label="Company Email-ID" type="email" [required]="true" [value]="eoiService.formData().orgBasicDetails.company_email" (valueChange)="eoiService.updateOrgBasicDetails({ company_email: $event }); onClearFieldError.emit('company_email')" [errorMessage]="validationErrors['company_email']"></app-form-field>
              <app-form-field label="Organisation PAN No." [uppercase]="true" [maxlength]="10" [value]="eoiService.formData().orgBasicDetails.organisation_pan" (valueChange)="eoiService.updateOrgBasicDetails({ organisation_pan: $event })"></app-form-field>
              <app-form-field label="Website" type="url" [value]="eoiService.formData().orgBasicDetails.website" (valueChange)="eoiService.updateOrgBasicDetails({ website: $event })"></app-form-field>
              <app-form-field label="Registered Address" type="textarea" [rows]="2" [required]="true" [maxlength]="250" [value]="eoiService.formData().orgBasicDetails.registered_address" (valueChange)="eoiService.updateOrgBasicDetails({ registered_address: $event }); onClearFieldError.emit('registered_address')" [errorMessage]="validationErrors['registered_address']"></app-form-field>
              <app-form-field label="State / UT" [required]="true" [value]="eoiService.formData().orgBasicDetails.state_ut" (valueChange)="eoiService.updateOrgBasicDetails({ state_ut: $event }); onClearFieldError.emit('state_ut')" [errorMessage]="validationErrors['state_ut']"></app-form-field>
              <app-form-field label="District" type="select" [options]="districts" [required]="true" [value]="eoiService.formData().orgBasicDetails.district" (valueChange)="eoiService.updateOrgBasicDetails({ district: $event }); onClearFieldError.emit('district')" [errorMessage]="validationErrors['district']"></app-form-field>
              <app-form-field label="Pincode" [required]="true" [maxlength]="6" [value]="eoiService.formData().orgBasicDetails.pincode" (valueChange)="eoiService.updateOrgBasicDetails({ pincode: $event }); onClearFieldError.emit('pincode')" [errorMessage]="validationErrors['pincode']"></app-form-field>
              <app-form-field label="Turn Over (₹ in Lakhs)" [required]="true" [value]="eoiService.formData().orgBasicDetails.turnover_lakhs" (valueChange)="eoiService.updateOrgBasicDetails({ turnover_lakhs: $event }); onClearFieldError.emit('turnover_lakhs')" [errorMessage]="validationErrors['turnover_lakhs']"></app-form-field>
              <app-form-field label="Date of Registration" type="date" [value]="eoiService.formData().orgBasicDetails.date_of_registration" (valueChange)="eoiService.updateOrgBasicDetails({ date_of_registration: $event })"></app-form-field>
              <app-form-field label="State Where Registered" [value]="eoiService.formData().orgBasicDetails.state_where_registered" (valueChange)="eoiService.updateOrgBasicDetails({ state_where_registered: $event })"></app-form-field>
              <app-form-field label="Type of business / activity" [value]="eoiService.formData().orgBasicDetails.type_of_business" (valueChange)="eoiService.updateOrgBasicDetails({ type_of_business: $event })"></app-form-field>
              <app-form-field label="Postal / Communication Address" type="textarea" [rows]="2" [required]="true" [maxlength]="250" [value]="eoiService.formData().orgBasicDetails.postal_address" (valueChange)="eoiService.updateOrgBasicDetails({ postal_address: $event }); onClearFieldError.emit('postal_address')" [errorMessage]="validationErrors['postal_address']"></app-form-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2 Edit: Authorized Person Details -->
      <div *ngIf="eoiService.activeEditSectionId() === 2">
        <div class="gov-card-section">
          <div class="gov-card-header">
            <h3 class="card-title">2. Authorized Person Details (Organisation Level) (17 Fields)</h3>
          </div>
          <div class="gov-card-body">
            <div *ngIf="hasEditValidationErrors()" class="gov-edit-error-banner">
              <div class="banner-icon">⚠️</div>
              <div class="banner-text">
                <strong>Mandatory Fields Incomplete:</strong> Please fill in all compulsory fields marked with <span class="req-star">*</span> before saving.
              </div>
            </div>

            <div class="gov-form-layout">
              <app-form-field label="Name" [required]="true" [maxlength]="100" [value]="eoiService.formData().authPersonDetails.auth_name" (valueChange)="eoiService.updateAuthPersonDetails({ auth_name: $event }); onClearFieldError.emit('auth_name')" [errorMessage]="validationErrors['auth_name']"></app-form-field>
              <app-form-field label="S/O, D/O, W/O" [value]="eoiService.formData().authPersonDetails.auth_guardian_name" (valueChange)="eoiService.updateAuthPersonDetails({ auth_guardian_name: $event })"></app-form-field>
              <app-form-field label="Date of Birth" type="date" [value]="eoiService.formData().authPersonDetails.auth_dob" (valueChange)="eoiService.updateAuthPersonDetails({ auth_dob: $event })"></app-form-field>
              <app-form-field label="Age" type="number" [value]="eoiService.formData().authPersonDetails.auth_age" (valueChange)="eoiService.updateAuthPersonDetails({ auth_age: $event })"></app-form-field>
              <app-form-field label="Designation" [value]="eoiService.formData().authPersonDetails.auth_designation" (valueChange)="eoiService.updateAuthPersonDetails({ auth_designation: $event })"></app-form-field>
              <app-form-field label="Mobile No." type="tel" [required]="true" [maxlength]="10" [value]="eoiService.formData().authPersonDetails.auth_mobile" (valueChange)="eoiService.updateAuthPersonDetails({ auth_mobile: $event }); onClearFieldError.emit('auth_mobile')" [errorMessage]="validationErrors['auth_mobile']"></app-form-field>
              <app-form-field label="Email-Id" type="email" [value]="eoiService.formData().authPersonDetails.auth_email" (valueChange)="eoiService.updateAuthPersonDetails({ auth_email: $event })"></app-form-field>
              <app-form-field label="State" [value]="eoiService.formData().authPersonDetails.auth_state" (valueChange)="eoiService.updateAuthPersonDetails({ auth_state: $event })"></app-form-field>
              <app-form-field label="Residence Address" type="textarea" [rows]="2" [value]="eoiService.formData().authPersonDetails.auth_residence_address" (valueChange)="eoiService.updateAuthPersonDetails({ auth_residence_address: $event })"></app-form-field>
              <app-form-field label="PAN" [uppercase]="true" [required]="true" [maxlength]="10" [value]="eoiService.formData().authPersonDetails.auth_pan" (valueChange)="eoiService.updateAuthPersonDetails({ auth_pan: $event }); onClearFieldError.emit('auth_pan')" [errorMessage]="validationErrors['auth_pan']"></app-form-field>
              <app-form-field label="Aadhaar No." [maxlength]="12" [value]="eoiService.formData().authPersonDetails.auth_aadhaar" (valueChange)="eoiService.updateAuthPersonDetails({ auth_aadhaar: $event })"></app-form-field>
              <app-form-field label="Type ID Proof" type="select" [options]="['Aadhaar Card', 'Voter ID', 'Passport', 'Driving License']" [value]="eoiService.formData().authPersonDetails.auth_id_proof_type" (valueChange)="eoiService.updateAuthPersonDetails({ auth_id_proof_type: $event })"></app-form-field>
              <app-form-field label="ID No." [value]="eoiService.formData().authPersonDetails.auth_id_number" (valueChange)="eoiService.updateAuthPersonDetails({ auth_id_number: $event })"></app-form-field>
              <app-form-field label="Bhamashah No." [value]="eoiService.formData().authPersonDetails.auth_bhamashah" (valueChange)="eoiService.updateAuthPersonDetails({ auth_bhamashah: $event })"></app-form-field>
              <app-form-field label="Voter Id No." [value]="eoiService.formData().authPersonDetails.auth_voter_id" (valueChange)="eoiService.updateAuthPersonDetails({ auth_voter_id: $event })"></app-form-field>
              <app-form-field label="Passport No." [value]="eoiService.formData().authPersonDetails.auth_passport_no" (valueChange)="eoiService.updateAuthPersonDetails({ auth_passport_no: $event })"></app-form-field>
              <app-form-field label="Service Tax / GST No." [value]="eoiService.formData().authPersonDetails.auth_service_tax_no" (valueChange)="eoiService.updateAuthPersonDetails({ auth_service_tax_no: $event })"></app-form-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3 Edit: Bank Details -->
      <div *ngIf="eoiService.activeEditSectionId() === 3">
        <div class="gov-card-section">
          <div class="gov-card-header">
            <h3 class="card-title">3. Bank Details (9 Fields)</h3>
          </div>
          <div class="gov-card-body">
            <div *ngIf="hasEditValidationErrors()" class="gov-edit-error-banner">
              <div class="banner-icon">⚠️</div>
              <div class="banner-text">
                <strong>Mandatory Fields Incomplete:</strong> Please fill in all compulsory fields marked with <span class="req-star">*</span> before saving.
              </div>
            </div>

            <div class="gov-form-layout">
              <app-form-field label="Name of the Bank" [required]="true" [value]="eoiService.formData().bankDetails.bank_name" (valueChange)="eoiService.updateBankDetails({ bank_name: $event }); onClearFieldError.emit('bank_name')" [errorMessage]="validationErrors['bank_name']"></app-form-field>
              <app-form-field label="Account No." [required]="true" [maxlength]="18" [value]="eoiService.formData().bankDetails.bank_account_no" (valueChange)="eoiService.updateBankDetails({ bank_account_no: $event }); onClearFieldError.emit('bank_account_no')" [errorMessage]="validationErrors['bank_account_no']"></app-form-field>
              <app-form-field label="IFSC Code" [uppercase]="true" [required]="true" [maxlength]="11" [value]="eoiService.formData().bankDetails.bank_ifsc" (valueChange)="eoiService.updateBankDetails({ bank_ifsc: $event }); onClearFieldError.emit('bank_ifsc')" [errorMessage]="validationErrors['bank_ifsc']"></app-form-field>
              <app-form-field label="Type of Account" type="select" [options]="['Current Account', 'Savings Account', 'Overdraft Account']" [value]="eoiService.formData().bankDetails.bank_account_type" (valueChange)="eoiService.updateBankDetails({ bank_account_type: $event })"></app-form-field>
              <app-form-field label="Mode of Electronic Transfer" type="select" [options]="['RTGS / NEFT / ECS / Direct Credit', 'NEFT Only', 'RTGS Only', 'IMPS / UPI']" [value]="eoiService.formData().bankDetails.bank_transfer_mode" (valueChange)="eoiService.updateBankDetails({ bank_transfer_mode: $event })"></app-form-field>
              <app-form-field label="Branch Name" [required]="true" [value]="eoiService.formData().bankDetails.bank_branch_name" (valueChange)="eoiService.updateBankDetails({ bank_branch_name: $event }); onClearFieldError.emit('bank_branch_name')" [errorMessage]="validationErrors['bank_branch_name']"></app-form-field>
              <app-form-field label="MICR Code" [maxlength]="9" [value]="eoiService.formData().bankDetails.bank_micr" (valueChange)="eoiService.updateBankDetails({ bank_micr: $event })"></app-form-field>
              <app-form-field label="Branch Address" type="textarea" [rows]="2" [required]="true" [value]="eoiService.formData().bankDetails.bank_branch_address" (valueChange)="eoiService.updateBankDetails({ bank_branch_address: $event }); onClearFieldError.emit('bank_branch_address')" [errorMessage]="validationErrors['bank_branch_address']"></app-form-field>
              <app-form-field label="Cancelled Cheque Proof File" [value]="eoiService.formData().bankDetails.bank_cancelled_cheque_doc" (valueChange)="eoiService.updateBankDetails({ bank_cancelled_cheque_doc: $event })"></app-form-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 5 Edit: Training Centre Details -->
      <div *ngIf="eoiService.activeEditSectionId() === 5">
        <div class="gov-card-section">
          <div class="gov-card-header">
            <h3 class="card-title">5. Training Centre &amp; Infrastructure Details</h3>
          </div>
          <div class="gov-card-body">
            <div *ngIf="hasEditValidationErrors()" class="gov-edit-error-banner">
              <div class="banner-icon">⚠️</div>
              <div class="banner-text">
                <strong>Mandatory Fields Incomplete:</strong> Please fill in all compulsory fields marked with <span class="req-star">*</span> before saving.
              </div>
            </div>

            <div class="gov-form-layout">
              <app-form-field label="District / City" type="select" [options]="districts" [required]="true" [value]="eoiService.formData().section6.district_city" (valueChange)="eoiService.updateSection6({ district_city: $event }); onClearFieldError.emit('district_city')" [errorMessage]="validationErrors['district_city']"></app-form-field>
              <app-form-field label="Training Centre Name" [required]="true" [maxlength]="100" hint="Max 100 characters" [value]="eoiService.formData().section6.training_center_name" (valueChange)="eoiService.updateSection6({ training_center_name: $event }); onClearFieldError.emit('training_center_name')" [errorMessage]="validationErrors['training_center_name']"></app-form-field>
              <app-form-field label="Telephone / Contact Number" type="tel" [required]="true" [maxlength]="11" [value]="eoiService.formData().section6.telephone_number" (valueChange)="eoiService.updateSection6({ telephone_number: $event }); onClearFieldError.emit('telephone_number')" [errorMessage]="validationErrors['telephone_number']"></app-form-field>
              <app-form-field label="Number of Classrooms" type="number" [required]="true" hint="Min 1 | Max 500" [value]="eoiService.formData().section6.number_of_classrooms" (valueChange)="eoiService.updateSection6({ number_of_classrooms: $event }); onClearFieldError.emit('number_of_classrooms')" [errorMessage]="validationErrors['number_of_classrooms']"></app-form-field>
              <app-form-field label="Full Address" type="textarea" [rows]="3" [required]="true" [maxlength]="250" hint="Max 250 characters" [value]="eoiService.formData().section6.full_address" (valueChange)="eoiService.updateSection6({ full_address: $event }); onClearFieldError.emit('full_address')" [errorMessage]="validationErrors['full_address']"></app-form-field>
              <app-form-field label="Number of Practical Rooms / Labs" type="number" [value]="eoiService.formData().section6.number_of_practical_rooms" (valueChange)="eoiService.updateSection6({ number_of_practical_rooms: $event })"></app-form-field>
              <app-form-field label="Separate Wash Rooms (M/F)" type="select" [options]="['Yes', 'No']" [value]="eoiService.formData().section6.separate_wash_rooms" (valueChange)="eoiService.updateSection6({ separate_wash_rooms: $event })"></app-form-field>
              <app-form-field label="Lab Infrastructure Available" type="select" [options]="['Yes', 'No']" [value]="eoiService.formData().section6.lab_infrastructure_available" (valueChange)="eoiService.updateSection6({ lab_infrastructure_available: $event })"></app-form-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Save Action -->
      <div class="gov-form-footer">
        <button type="button" class="gov-btn gov-btn-secondary" (click)="onCancelSection.emit()">
          ← Cancel
        </button>
        <button type="button" class="gov-btn gov-btn-primary" (click)="onSaveSection.emit()">
          ✓ Save &amp; Return to Preview
        </button>
      </div>

    </div>
  `
})
export class StepPreviewComponent {
  readonly eoiService = inject(EoiService);
  readonly districts = RAJASTHAN_DISTRICTS;

  @Input() scheme: Scheme | null = null;
  @Input() validationErrors: Record<string, string> = {};

  @Output() onOpenSubmitConfirm = new EventEmitter<void>();
  @Output() onViewDoc = new EventEmitter<{ title: string; fileName: string; fileSize: string }>();
  @Output() onClearFieldError = new EventEmitter<string>();
  @Output() onSaveSection = new EventEmitter<void>();
  @Output() onCancelSection = new EventEmitter<void>();
  @Output() onEditSection = new EventEmitter<number>();

  hasEditValidationErrors(): boolean {
    return Object.keys(this.validationErrors).length > 0;
  }

  editSection(sectionId: number): void {
    this.onEditSection.emit(sectionId);
  }

  onPreviewFileSelected(sNo: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.eoiService.uploadPreviewDocument(sNo, file);
      input.value = '';
    }
  }
}
