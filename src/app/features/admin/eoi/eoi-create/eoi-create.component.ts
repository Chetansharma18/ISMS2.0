import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EoiFieldService } from '../../core/services/eoi-field.service';
import { EoiFormField } from '../../core/models/admin.models';
import { ToastService } from '../../core/services/toast.service';
import { FormFieldComponent } from '../../../eoi/application-wizard/components/shared/form-field.component';

@Component({
  selector: 'admin-eoi-create',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    PageHeaderComponent,
    FormFieldComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eoi-create.component.html'
})
export class EoiCreateComponent implements OnInit {
  readonly router = inject(Router);
  readonly eoiFieldService = inject(EoiFieldService);
  readonly toastService = inject(ToastService);

  readonly dynamicFields = signal<EoiFormField[]>([]);
  readonly dynamicResponses: Record<string, any> = {};
  readonly validationErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    // Load the dynamic fields meant for the Create EOI page itself
    this.eoiFieldService.getFieldsForEoi('EOI-2025-001').subscribe(fields => {
      this.dynamicFields.set(fields);
    });
  }

  clearFieldError(fieldId: string): void {
    if (this.validationErrors()[fieldId]) {
      const current = { ...this.validationErrors() };
      delete current[fieldId];
      this.validationErrors.set(current);
    }
  }

  saveAsDraft(): void {
    this.toastService.success('Draft Saved', 'Your EOI draft has been saved successfully.');
    this.router.navigate(['/admin/eoi']);
  }

  onSubmitPublish(): void {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    this.dynamicFields().forEach(field => {
      if (field.required && !this.dynamicResponses[field.id]) {
        errors[field.id] = `${field.fieldLabel} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.toastService.error('Validation Error', 'Please fill all mandatory fields before publishing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.validationErrors.set({});
    
    // In a real app, this would send `dynamicResponses` to the server to create the EOI
    this.toastService.success('EOI Published', 'The EOI has been successfully published using the dynamic configuration.');
    this.router.navigate(['/admin/eoi']);
  }
}
