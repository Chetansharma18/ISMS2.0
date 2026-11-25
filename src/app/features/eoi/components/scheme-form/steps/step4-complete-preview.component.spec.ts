import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Step4CompletePreviewComponent } from './step4-complete-preview.component';
import { SchemeFormState } from '../scheme-form.state';
import { EoiApplyService } from '../eoi-apply.service';
import { EoiApplication } from '../eoi-apply.model';
import { OtrRegistrationService } from '../../../../registration/services/otr-registration.service';

const doc = (id: number, name: string, category: string | null, uploaded: boolean) => ({
  requiredDocumentId: id, name, category, isMandatory: true, comment: null,
  documentId: uploaded ? 100 + id : null,
  file: uploaded ? { fileName: `${name}.pdf`, contentType: 'application/pdf', sizeBytes: 2048, uploadedAt: '2026-11-24T10:00:00Z', url: '' } : null,
  allowedExtensions: ['.pdf'], maxFileSizeMb: 5
});

function application(uploadedAll: boolean): EoiApplication {
  return {
    id: 3, applicationNo: 'APP-2026-000003', status: 'Draft', isEditable: true,
    notice: {
      id: 1, refNo: 'RSLDC/EOI/2026-27/01', schemeName: 'Scheme 1', schemeCategory: 'Rajvik', eoiCategory: 'GENERAL',
      description: 'Proposal', publishedDate: '2026-11-24', closingDate: '2026-11-30', durationYears: 1,
      emdFee: 100000, processFee: 25000, isFeeExempted: false, myApplication: null
    },
    otrReferenceNo: 'OTR-1', profile: {},
    steps: [
      { key: 'organisation', title: 'Organisation Details', completed: true },
      { key: 'authorized-person', title: 'Authorized Person', completed: true },
      { key: 'bank-details', title: 'Bank Details', completed: true },
      { key: 'processing-fee', title: 'Processing Fee', completed: false },
      { key: 'documents', title: 'Upload Documents', completed: uploadedAll }
    ],
    processFee: { amount: 25000, required: true, done: false, prn: null, paidAt: null },
    emd: { amount: 100000, required: true, done: false, prn: null, paidAt: null, mode: 'None', exemptionEligible: false, udyamNumber: null },
    documents: [doc(1, 'Income Proof', null, true), doc(6, 'Annexure-1: Covering Letter', 'Annexure', uploadedAll)],
    missingForSubmit: [], declarationAccepted: false, createdAt: '2026-11-24T10:00:00Z', updatedAt: null, submittedAt: null,
    dynamicAnswers: null, customFields: []
  };
}

describe('Step4CompletePreviewComponent', () => {
  let fixture: ComponentFixture<Step4CompletePreviewComponent>;
  let state: SchemeFormState;

  function setup(uploadedAll: boolean): void {
    TestBed.configureTestingModule({
      imports: [Step4CompletePreviewComponent],
      providers: [
        SchemeFormState,
        { provide: ActivatedRoute, useValue: { queryParams: of({ eoiId: '1' }), snapshot: { queryParamMap: new Map() } } },
        { provide: EoiApplyService, useValue: { start: () => of(application(uploadedAll)) } },
        { provide: OtrRegistrationService, useValue: { load: () => throwError(() => new Error('no OTR form')) } }
      ]
    });
    state = TestBed.inject(SchemeFormState);
    fixture = TestBed.createComponent(Step4CompletePreviewComponent);
    fixture.detectChanges();
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('lists the EOI documents and annexures from the application with their upload status', () => {
    setup(false);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Documents (1 / 2 Uploaded)');
    expect(text).toContain('Income Proof');
    expect(text).toContain('Annexure-1: Covering Letter');
    expect(text).toContain('Upload the mandatory document: Annexure-1: Covering Letter.');
  });

  it('opens the fee step only when nothing is missing and the declaration is ticked', () => {
    setup(true);
    const proceed = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find(b => b.textContent?.includes('Proceed to Processing Fee')) as HTMLButtonElement;
    expect(state.pendingBeforeFees()).toEqual([]);
    expect(proceed().disabled).toBe(true);

    state.declarationAgreed.set(true);
    fixture.detectChanges();
    expect(proceed().disabled).toBe(false);
  });
});
