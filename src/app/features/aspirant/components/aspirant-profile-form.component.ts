import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  output,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormSdcComponent, FormSectionConfig } from '../../../shared/components/form-sdc';
import { RAJASTHAN_DISTRICTS, AspirantFormData, calculateAgeFromDob } from '../../sdc/config/aspirant-form.config';
import { createEmptyAspirantFormData } from '../../sdc/components/aspirant-mapping/aspirant-form-data.factory';
import { AspirantPortalService } from '../services/aspirant-portal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-aspirant-profile-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, FormSdcComponent],
  template: `
    <div class="space-y-4 font-sans">
      <app-form-sdc
        [sections]="formSections"
        [(model)]="formData"
        layout="cards"
        density="compact"
        [gridCols]="4"
        submitLabel="Save & Submit Profile"
        cancelLabel="Reset Form"
        [showSubmit]="true"
        [showCancel]="true"
        [submitLoading]="isSubmitting()"
        (formSubmit)="onFormSubmit($event)"
        (formCancel)="onResetForm()"
        (fieldChange)="onFieldChange($event)"
      ></app-form-sdc>
    </div>
  `
})
export class AspirantProfileFormComponent implements OnInit {
  private portalService = inject(AspirantPortalService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly profileSaved = output<AspirantFormData>();
  readonly isSubmitting = signal<boolean>(false);

  formData: AspirantFormData = createEmptyAspirantFormData();

  readonly formSections: FormSectionConfig<AspirantFormData>[] = [
    // 1. Personal Details
    {
      id: 'personal',
      title: '1. Personal Details',
      icon: 'user',
      gridCols: 4,
      fields: [
        {
          key: 'aadhaarNo',
          label: 'Aadhaar No.',
          type: 'text',
          required: true,
          maxLength: 12,
          pattern: '^[0-9]{12}$',
          patternMessage: 'Aadhaar number must be exactly 12 digits',
          placeholder: 'Enter 12-digit Aadhaar No.',
          colSpan: 1
        },
        {
          key: 'janaadhaarId',
          label: 'Janaadhaar Id',
          type: 'text',
          required: true,
          maxLength: 10,
          placeholder: 'Enter 10-digit Jan Aadhaar ID',
          colSpan: 1
        },
        {
          key: 'otherIdType',
          label: 'Other IDs',
          type: 'select',
          colSpan: 1,
          options: [
            { label: 'None', value: 'None' },
            { label: 'PAN Card', value: 'PAN Card' },
            { label: 'Voter ID (EPIC)', value: 'Voter ID (EPIC)' },
            { label: 'Driving License', value: 'Driving License' },
            { label: 'Passport', value: 'Passport' },
            { label: 'Ration Card', value: 'Ration Card' }
          ]
        },
        {
          key: 'otherIdNo',
          label: (m: AspirantFormData) => {
            const t = (m?.otherIdType || '').trim();
            if (!t || t === 'None') return 'Other ID Nos.';
            return t;
          },
          placeholder: (m: AspirantFormData) => {
            const t = (m?.otherIdType || '').trim();
            if (t === 'PAN Card') return 'e.g. ABCDE1234F  (10 chars)';
            if (t.includes('Voter')) return 'e.g. ABC1234567  (10 chars)';
            if (t === 'Driving License') return 'e.g. RJ01 20110012345  (up to 16 chars)';
            if (t === 'Passport') return 'e.g. A1234567  (8 chars)';
            if (t === 'Ration Card') return 'Enter Ration Card number';
            return 'Enter document number';
          },
          type: 'text',
          uppercase: true,
          colSpan: 1,
          visible: (m: AspirantFormData) => !!m?.otherIdType && m.otherIdType !== 'None'
        },
        {
          key: 'aspirantName',
          label: 'Name of Aspirant',
          type: 'text',
          required: true,
          placeholder: 'Enter candidate full name',
          colSpan: 1
        },
        {
          key: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          placeholder: 'Select Gender',
          colSpan: 1,
          options: [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Transgender', value: 'Transgender' }
          ]
        },
        {
          key: 'relationType',
          label: 'Select Relation',
          type: 'select',
          required: true,
          placeholder: 'Select Relation',
          colSpan: 1,
          options: [
            { label: 'Father', value: 'Father' },
            { label: 'Husband', value: 'Husband' },
            { label: 'Guardian', value: 'Guardian' }
          ]
        },
        {
          key: 'relationName',
          label: (m: AspirantFormData) => {
            const rel = (m?.relationType || '').trim();
            return rel ? `${rel}'s Name` : 'Relation Name';
          },
          placeholder: (m: AspirantFormData) => {
            const rel = (m?.relationType || '').trim();
            return rel ? `Enter ${rel}'s Name` : 'Enter Relation Name';
          },
          type: 'text',
          required: true,
          visible: (m: AspirantFormData) => !!m?.relationType,
          colSpan: 1
        },
        {
          key: 'motherName',
          label: "Mother's Name",
          type: 'text',
          required: true,
          placeholder: "Enter Mother's Name",
          colSpan: 1
        },
        {
          key: 'dob',
          label: 'Date of Birth (dd/mm/yyyy)',
          type: 'date',
          required: true,
          colSpan: 1,
          onChange: (val, field, model) => {
            if (val) {
              model.age = calculateAgeFromDob(val);
            }
          }
        },
        {
          key: 'age',
          label: 'Age',
          type: 'number',
          readonly: true,
          placeholder: 'Auto-calculated',
          suffixText: 'Yrs',
          colSpan: 1
        },
        {
          key: 'religion',
          label: 'Religion',
          type: 'select',
          required: true,
          placeholder: 'Select Religion',
          colSpan: 1,
          options: [
            { label: 'Hindu', value: 'Hindu' },
            { label: 'Muslim', value: 'Muslim' },
            { label: 'Sikh', value: 'Sikh' },
            { label: 'Christian', value: 'Christian' },
            { label: 'Jain', value: 'Jain' },
            { label: 'Buddhist', value: 'Buddhist' },
            { label: 'Other', value: 'Other' }
          ]
        },
        {
          key: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          placeholder: 'Select Category',
          colSpan: 1,
          options: [
            { label: 'General', value: 'General' },
            { label: 'OBC', value: 'OBC' },
            { label: 'SC', value: 'SC' },
            { label: 'ST', value: 'ST' },
            { label: 'EWS', value: 'EWS' },
            { label: 'MBC', value: 'MBC' }
          ]
        },
        {
          key: 'economicStatus',
          label: 'Economic Status',
          type: 'select',
          required: true,
          placeholder: 'Select Economic Status',
          colSpan: 1,
          options: [
            { label: 'APL (Above Poverty Line)', value: 'APL' },
            { label: 'BPL (Below Poverty Line)', value: 'BPL' },
            { label: 'Antyodaya', value: 'Antyodaya' },
            { label: 'State BPL', value: 'State BPL' }
          ]
        },
        {
          key: 'educationalQualification',
          label: 'Educational Qualification',
          type: 'select',
          required: true,
          placeholder: 'Select Educational Qualification',
          colSpan: 1,
          options: [
            { label: 'Illiterate', value: 'Illiterate' },
            { label: 'Literate', value: 'Literate' },
            { label: '5th Pass', value: '5th Pass' },
            { label: '6th Pass', value: '6th Pass' },
            { label: '7th Pass', value: '7th Pass' },
            { label: '8th Pass', value: '8th Pass' },
            { label: '9th Pass', value: '9th Pass' },
            { label: '10th Pass', value: '10th Pass' },
            { label: '12th Pass', value: '12th Pass' },
            { label: 'Diploma', value: 'Diploma' },
            { label: 'Graduate', value: 'Graduate' },
            { label: 'Post Graduate', value: 'Post Graduate' },
            { label: 'Not Applicable', value: 'Not Applicable' },
            { label: 'Other', value: 'Other' }
          ]
        },
        {
          key: 'specialAbility',
          label: 'Person with Special Ability',
          type: 'select',
          required: true,
          placeholder: 'Select Person with Special Ability',
          colSpan: 1,
          options: [
            { label: 'No', value: 'No' },
            { label: 'Yes', value: 'Yes' }
          ]
        },
        {
          key: 'interestedSector',
          label: 'Interested Sector',
          type: 'select',
          required: true,
          placeholder: 'Select Interested Sector',
          colSpan: 2,
          options: [
            { label: 'Apparel & Garment Making', value: 'Apparel & Garment Making' },
            { label: 'Electronics & Hardware', value: 'Electronics & Hardware' },
            { label: 'Healthcare & Allied Services', value: 'Healthcare & Allied Services' },
            { label: 'IT-ITeS / Software', value: 'IT-ITeS' },
            { label: 'Tourism & Hospitality', value: 'Tourism & Hospitality' },
            { label: 'Automotive & EV', value: 'Automotive' },
            { label: 'Construction & Real Estate', value: 'Construction' },
            { label: 'Beauty & Wellness', value: 'Beauty & Wellness' },
            { label: 'Solar & Green Energy', value: 'Solar & Green Energy' },
            { label: 'Retail & Logistics', value: 'Retail & Logistics' }
          ]
        }
      ]
    },

    // 2. Training and Employment Details
    {
      id: 'trainingEmployment',
      title: '2. Training and Employment Details',
      icon: 'academic',
      gridCols: 4,
      fields: [
        {
          key: 'trainingPreferredDistrict',
          label: 'Training Preferred District',
          type: 'select',
          required: true,
          placeholder: 'Select Preferred District',
          colSpan: 2,
          options: RAJASTHAN_DISTRICTS.map(d => ({ label: d, value: d }))
        },
        {
          key: 'employmentType',
          label: 'Type of Employment',
          type: 'select',
          required: true,
          placeholder: 'Select Employment Type',
          colSpan: 2,
          options: [
            { label: 'Wages Employment', value: 'Wages Employment' },
            { label: 'Self Employment', value: 'Self Employment' },
            { label: 'Both Employment', value: 'Both Employment' }
          ]
        }
      ]
    },

    // 3. Address Details
    {
      id: 'address',
      title: '3. Address Details',
      icon: 'location',
      gridCols: 4,
      fields: [
        {
          key: 'address',
          label: 'Address',
          type: 'textarea',
          required: true,
          rows: 2,
          placeholder: 'Enter House No., Street, Locality / Village',
          colSpan: 4
        },
        {
          key: 'homeDistrict',
          label: 'Home District',
          type: 'select',
          required: true,
          placeholder: 'Select Home District',
          colSpan: 2,
          options: RAJASTHAN_DISTRICTS.map(d => ({ label: d, value: d }))
        },
        {
          key: 'ruralUrban',
          label: 'Rural/Urban',
          type: 'select',
          required: true,
          placeholder: 'Select Rural/Urban',
          colSpan: 1,
          options: [
            { label: 'Rural', value: 'Rural' },
            { label: 'Urban', value: 'Urban' }
          ]
        },
        {
          key: 'pincode',
          label: 'Pincode',
          type: 'text',
          required: true,
          maxLength: 6,
          pattern: '^[1-9][0-9]{5}$',
          patternMessage: 'Pincode must be a 6-digit number',
          placeholder: 'Enter 6-digit Pincode',
          colSpan: 1
        }
      ]
    },

    // 4. Contact Details
    {
      id: 'contact',
      title: '4. Contact Details',
      icon: 'building',
      gridCols: 3,
      fields: [
        {
          key: 'mobileNo',
          label: 'Mobile Number',
          type: 'tel',
          required: true,
          maxLength: 10,
          pattern: '^[6-9][0-9]{9}$',
          patternMessage: 'Mobile number must be a valid 10-digit number',
          prefixText: '+91',
          placeholder: '10-digit mobile number',
          colSpan: 1
        },
        {
          key: 'altMobileNo',
          label: 'Alternate Mobile Number',
          type: 'tel',
          maxLength: 10,
          pattern: '^[6-9][0-9]{9}$',
          patternMessage: 'Alternate mobile must be a valid 10-digit number',
          prefixText: '+91',
          placeholder: 'Alternate mobile (optional)',
          colSpan: 1
        },
        {
          key: 'email',
          label: 'Email Id',
          type: 'email',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          patternMessage: 'Please enter a valid email address',
          placeholder: 'name@example.com',
          colSpan: 1
        }
      ]
    },

    // 5. Upload and Consent
    {
      id: 'uploadConsent',
      title: '5. Upload and Consent',
      icon: 'document',
      gridCols: 4,
      fields: [
        {
          key: 'candidatePhoto',
          label: 'Upload Candidate Photo',
          type: 'photo',
          accept: 'image/*,.jpg,.jpeg,.png',
          maxFileSizeMb: 5,
          placeholder: 'Double click to Upload Image',
          colSpan: 4
        },
        {
          key: 'termsAccepted',
          label: 'I accept the Terms & Conditions and declare that the information provided is correct to the best of my knowledge.',
          type: 'checkbox',
          required: true,
          requiredMessage: 'You must accept the Terms & Conditions to proceed',
          colSpan: 4
        }
      ]
    }
  ];

  ngOnInit(): void {
    const existing = this.portalService.profileData();
    if (existing && existing.aadhaarNo) {
      this.formData = { ...existing };
    }
    if (!this.formData.registrationNo) {
      this.formData.registrationNo = 'ASP/' + new Date().getFullYear() + '/08421';
    }
    if (this.formData.dob && !this.formData.age) {
      this.formData.age = calculateAgeFromDob(this.formData.dob);
    }
  }

  onFieldChange(event: { key: string; value: any; model: any }): void {
    if (event.key === 'dob' && event.value) {
      this.formData.age = calculateAgeFromDob(event.value);
    }
    if (event.key === 'relationType') {
      this.formData.relation = event.value;
    }
    if (event.key === 'ruralUrban') {
      this.formData.areaType = event.value;
    }
    if (event.key === 'address') {
      this.formData.permStreet = event.value;
    }
    if (event.key === 'homeDistrict') {
      this.formData.permDistrict = event.value;
    }
    if (event.key === 'pincode') {
      this.formData.permPincode = event.value;
    }
  }

  onFormSubmit(model: Record<string, any>): void {
    const data = model as AspirantFormData;
    if (!data.termsAccepted) {
      this.notification.warning('Please accept the Terms & Conditions before submitting.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      // Sync legacy address & contact fields for backward compatibility
      if (data.address) {
        data.permStreet = data.address;
        data.permCity = data.address;
      }
      if (data.homeDistrict) {
        data.permDistrict = data.homeDistrict;
      }
      if (data.pincode) {
        data.permPincode = data.pincode;
      }
      if (data.ruralUrban) {
        data.areaType = data.ruralUrban;
      }

      this.portalService.saveProfile(data);
      this.authService.markProfileCompleted();
      this.isSubmitting.set(false);
      this.notification.success('Aspirant profile registration saved successfully!');
      this.profileSaved.emit(data);
    }, 400);
  }

  onResetForm(): void {
    this.portalService.resetProfile();
    this.formData = createEmptyAspirantFormData();
    this.formData.registrationNo = 'ASP/' + new Date().getFullYear() + '/08421';
    this.notification.info('Form has been reset to defaults.');
  }
}
