import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent, FormInputComponent, FormSectionComponent, IconComponent } from '../../../../shared';
import { AspirantRecord } from '../../models/aspirant.model';
import { ASPIRANT_STATUS_LABEL } from '../aspirant-list.component';

/** One read-only box of the view: its label, what to show and how wide it is. */
interface ViewField {
  label: string;
  value: string;
  span: string;
}

const SPAN = {
  2: 'lg:col-span-2 sm:col-span-1',
  3: 'lg:col-span-3 sm:col-span-1',
  4: 'lg:col-span-4 sm:col-span-1',
  6: 'lg:col-span-6 sm:col-span-2',
  12: 'lg:col-span-12 sm:col-span-2'
} as const;

type Span = keyof typeof SPAN;

function field(label: string, value: unknown, span: Span = 3): ViewField {
  const text = value === null || value === undefined || value === '' ? '—' : String(value);
  return { label, value: text, span: SPAN[span] };
}

/**
 * The details of a registered aspirant laid out like the registration form: same card, sections and boxes, read-only.
 * Every box is a disabled form input, so it looks like the form and cannot be changed here.
 */
@Component({
  selector: 'app-aspirant-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormInputComponent, FormSectionComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
      @for (section of sections(); track section.title) {
        <app-form-section class="block" [title]="section.title">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            @for (f of section.fields; track f.label) {
              <div [class]="f.span">
                <app-form-input [label]="f.label" [disabled]="true" [value]="f.value"></app-form-input>
              </div>
            }
            @if (section.title === 'Identity Details') {
              <div class="lg:col-span-6 sm:col-span-2">
                <app-form-input label="Aadhaar Card Document Proof" [disabled]="true" [value]="aadhaarProof()"></app-form-input>
              </div>
              <div class="lg:col-span-2 sm:col-span-1 sm:pt-5">
                <button appButton variant="outline" size="sm" type="button" (click)="previewAadhaar.emit()" title="Preview Aadhaar Card">
                  <app-icon name="eye" size="sm" />
                  <span>Preview</span>
                </button>
              </div>
            }
          </div>
        </app-form-section>
      }
    </div>
  `
})
export class AspirantViewComponent {
  readonly aspirant = input.required<AspirantRecord>();
  readonly previewAadhaar = output<void>();

  protected readonly aadhaarProof = computed(() => this.aspirant().aadhaarDocName || 'Aadhaar_Document.pdf');

  protected readonly sections = computed(() => {
    const a = this.aspirant();
    const sameAddress = !!a.isAddressSame;

    const sections: { title: string; fields: ViewField[] }[] = [
      {
        title: 'Aspirant',
        fields: [
          field('Aspirant ID', a.id, 3),
          field('Training Status', ASPIRANT_STATUS_LABEL[a.trainingStatus] ?? a.trainingStatus, 3),
          field('Enrolled On', a.enrollmentDate, 2),
          field('Biometric', a.biometricVerified ? 'Verified' : 'Not verified', 2),
          field('Attendance', a.attendancePercent != null ? `${a.attendancePercent}%` : '', 2)
        ]
      },
      {
        title: 'Batch & Center',
        fields: [
          field('Batch Code', a.batchCode, 3),
          field('Course', a.courseName, 6),
          field('Sector', a.sector, 3),
          field('Scheme', a.scheme, 3),
          field('Center Name', a.sdcName, 6),
          field('Center Code', a.sdcCode, 3),
          field('Center District', a.sdcDistrict, 3)
        ]
      },
      {
        title: 'Identity Details',
        fields: [
          field('Aadhaar No.', a.aadhaarMasked, 3),
          field('Janaadhaar ID', a.janaadhaarId, 3),
          field('Other ID', a.otherIdType && a.otherIdType !== 'None' ? a.otherIdType : '', 3),
          field('Other ID No.', a.otherIdNo, 3)
        ]
      },
      {
        title: 'Personal Details',
        fields: [
          field('Name of Aspirant', a.aspirantName, 6),
          field('Gender', a.gender, 3),
          field('Date of Birth', a.dob, 3),
          field('Relation', a.relationType, 3),
          field('Name of Relation', a.relationName, 6),
          field('Age', a.age !== '' && a.age != null ? `${a.age} yrs` : '', 3),
          field("Mother's Name", a.motherName, 6),
          field('Educational Qualification', a.educationalQualification, 6),
          field('Religion', a.religion, 3),
          field('Category', a.category, 3),
          field('Minority', a.minority, 3),
          field('Person with Special Ability (PwD)', a.specialAbility, 3),
          ...(a.specialAbility === 'Yes' ? [field('Disability Type', a.disabilityType, 3)] : []),
          field('Rural / Urban', a.areaType, 3),
          field('Interested Out of Rajasthan', a.interestedOutOfRajasthan || 'No', 3)
        ]
      },
      {
        title: 'Permanent Address',
        fields: [
          field('House / Building No.', a.permHouseNo),
          field('Street / Locality', a.permStreet),
          field('Ward', a.permWard),
          field('Village / City', a.permCity),
          field('District', a.permDistrict),
          field('Block', a.permBlock),
          field('Tehsil', a.permTehsil),
          field('Municipality / Panchayat', a.permMunicipality),
          field('Pincode', a.permPincode),
          field('Assembly Constituency', a.permAssembly),
          field('Parliamentary Constituency', a.permParliament)
        ]
      },
      {
        title: 'Communication Address',
        fields: sameAddress
          ? [field('Address', 'Same as the permanent address', 12)]
          : [
              field('House / Building No.', a.commHouseNo),
              field('Street / Locality', a.commStreet),
              field('Ward', a.commWard),
              field('Village / City', a.commCity),
              field('District', a.commDistrict),
              field('Block', a.commBlock),
              field('Tehsil', a.commTehsil),
              field('Municipality / Panchayat', a.commMunicipality),
              field('Pincode', a.commPincode)
            ]
      },
      {
        title: 'Contact Details',
        fields: [
          field('Mobile No.', a.mobileNo),
          field('Alternate Mobile No.', a.altMobileNo),
          field('Landline No.', a.landlineNo),
          field('E-mail', a.email)
        ]
      },
      {
        title: 'Bank Details',
        fields: [
          field('Account Holder Name', a.bankAccountName || a.aspirantName, 6),
          field('Bank Name', a.bankName, 6),
          field('Account No.', a.bankAccountNo, 3),
          field('Account Type', a.bankAccountType, 3),
          field('IFSC Code', a.ifscCode, 3),
          field('Branch', a.bankBranch, 3),
          field('MICR Code', a.micrCode, 3)
        ]
      },
      {
        title: 'Economic & Worker Details',
        fields: [
          field('Annual Family Income (₹)', a.annualFamilyIncome),
          field('Income Slab', a.incomeSlab),
          field('Economic Status', a.economicStatus),
          field('Ration / BPL Card No.', a.economicCardNo),
          field('BoCW Registered', [a.bocwWorker || 'No', a.bocwNo].filter(Boolean).join(' • ')),
          field('MGNREGA Worker', [a.mgnregaWorker || 'No', a.mgnregaNo].filter(Boolean).join(' • ')),
          field('RSBY Beneficiary', [a.isRsby || 'No', a.rsbyNo].filter(Boolean).join(' • ')),
          field('Gram Sabha PIP Listed', a.gramsabhaPip || 'No'),
          field('NRLM / SHG Member', [a.nrlmMember || 'No', a.nrlmNo].filter(Boolean).join(' • ')),
          field('Voter ID (EPIC No.)', a.epicNo),
          field('Sector Preferences', (a.preferredSectors ?? []).join(', '), 6)
        ]
      }
    ];
    return sections;
  });
}
