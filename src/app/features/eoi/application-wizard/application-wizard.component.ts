import { Component, inject, signal, effect, HostListener, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { StepReceiptComponent } from './components/step-receipt/step-receipt.component';
import { FormFieldComponent } from './components/shared/form-field.component';
import { EoiService } from './services/eoi.service';
import { EoiStateService, Scheme } from '../../../core/services/eoi-state.service';
import { EoiFieldService } from '../../admin/core/services/eoi-field.service';
import { EoiFormField } from '../../admin/core/models/admin.models';

@Component({
  selector: 'app-application-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    StepReceiptComponent,
    FormFieldComponent,
    DecimalPipe
  ],
  templateUrl: './application-wizard.component.html',
  styleUrls: ['./application-wizard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationWizardComponent implements OnInit {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly eoiStateService = inject(EoiStateService);
  readonly eoiService = inject(EoiService);
  readonly eoiFieldService = inject(EoiFieldService);

  readonly selectedScheme = signal<Scheme | null>(null);
  
  // Dynamic fields
  readonly dynamicFields = signal<EoiFormField[]>([]);
  readonly dynamicResponses: Record<string, any> = {};

  // Modals state
  readonly showPaymentModal = signal<boolean>(false);
  readonly showPaymentSuccessModal = signal<boolean>(false);
  readonly validationErrors = signal<Record<string, string>>({});
  
  // Payment mock fields
  readonly paymentMethod = signal<string>('');

  // Receipt copy state
  readonly copiedRef = signal<boolean>(false);

  constructor() {
    effect(() => {
      const anyModalOpen = this.showPaymentModal() || this.showPaymentSuccessModal();
      if (anyModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    effect(() => {
      this.eoiService.flowStage();
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const schemeId = params.get('id') || 'EOI-MMKVY-2026-01';
      this.loadSchemeDetails(schemeId);
    });
  }

  private loadSchemeDetails(schemeId: string): void {
    this.eoiStateService.schemes$.subscribe(schemes => {
      const active = schemes.find(s => s.id === schemeId || s.schemeCode === schemeId || s.tenderId === schemeId) || (schemes.length > 0 ? schemes[0] : null);
      if (active) {
        this.selectedScheme.set(active);
        
        // Fetch dynamic fields for this scheme
        this.eoiFieldService.getFieldsForEoi(active.schemeCode).subscribe((list: any) => {
          this.dynamicFields.set(list);
        });

        // Setup fees
        this.eoiService.setSchemeFees(
          active.processingFee,
          active.emdAmount,
          active.name,
          active.eoiReferenceNo,
          active.id || active.schemeCode
        );
      }
    });
  }

  goToAllSchemes(): void {
    this.router.navigate(['/schemes']);
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showPaymentModal()) this.showPaymentModal.set(false);
    if (this.showPaymentSuccessModal()) this.showPaymentSuccessModal.set(false);
  }

  clearFieldError(field: string): void {
    if (this.validationErrors()[field]) {
      const current = { ...this.validationErrors() };
      delete current[field];
      this.validationErrors.set(current);
    }
  }

  // Submit flow
  initiateSubmitAndPay(): void {
    const errors: Record<string, string> = {};
    
    // Basic validation of required dynamic fields
    this.dynamicFields().forEach(field => {
      if (field.required && !this.dynamicResponses[field.id]) {
        errors[field.id] = `${field.fieldLabel} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.eoiService.showToast('Please fill all mandatory fields before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.validationErrors.set({});
    
    // Save the dynamic responses into the service if needed
    // this.eoiService.saveDynamicResponses(this.dynamicResponses);

    this.showPaymentModal.set(true);
  }

  processPayment(): void {
    if (!this.paymentMethod()) {
       this.eoiService.showToast('Please select a payment method.');
       return;
    }
    
    // Process mock payment
    this.eoiService.processMockPayment(() => {
      this.showPaymentModal.set(false);
      this.showPaymentSuccessModal.set(true);
    });
  }

  continueToReceipt(): void {
    this.showPaymentSuccessModal.set(false);
    this.eoiService.setFlowStage('receipt');
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
  }

  // Receipt Actions
  copyApplicationNumber(): void {
    const sub = this.eoiService.submissionData();
    if (sub.applicationNumber) {
      navigator.clipboard.writeText(sub.applicationNumber).then(() => {
        this.copiedRef.set(true);
        setTimeout(() => this.copiedRef.set(false), 2000);
      });
    }
  }

  printReceipt(): void {
    window.print();
  }

  downloadReceipt(): void {
    this.eoiService.showToast('Receipt download started...');
  }

  reopenForModification(): void {
    this.eoiService.setFlowStage('documents');
  }

  toggleDeadlineSimulation(): void {
    const current = this.eoiService.simulateExpiredDeadline();
    this.eoiService.simulateExpiredDeadline.set(!current);
    if (!current) {
      this.eoiService.showToast('Testing Mode: Modification deadline marked as EXPIRED.');
    } else {
      this.eoiService.showToast('Testing Mode: Modification deadline reset to ACTIVE.');
    }
  }
}
