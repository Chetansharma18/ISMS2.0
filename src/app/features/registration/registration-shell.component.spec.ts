import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApiUrl } from '../../core/config/api.config';
import { provideApiHttp } from '../../core/http/http.providers';
import { NotificationService } from '../../core/services/notification.service';
import { OtrFullFormResponse, OtrStepRecord } from './models/otr-api.model';
import { RegistrationShellComponent } from './registration-shell.component';
import { OtrRegistrationService } from './services/otr-registration.service';
import { stepFields } from './otr-form.util';

const fx = (fieldKey: string, label: string, fieldType: string, isRequired: boolean, sectionName: string) =>
  ({ fieldKey, label, fieldType, isRequired, sectionName });

const FORM: OtrFullFormResponse = {
  version: 1,
  title: 'Organization Registration',
  description: 'Please provide the required details to complete the registration process.',
  steps: [
    {
      stepKey: 'organisation', stepTitle: 'Organisation Details', stepSubtitle: 'Step 1 of the application',
      dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
      fixedFields: [
        fx('organisationName', 'Organisation Name', 'text', true, '1. Basic Organisation Details'),
        fx('organisationPan', 'Organisation PAN', 'text', true, '2. Registration & Documents'),
        fx('panCardDoc', 'Organisation PAN Card', 'file', true, '2. Registration & Documents')
      ]
    },
    {
      stepKey: 'authorized-person', stepTitle: 'Authorized Person Details', stepSubtitle: 'Step 2 of the application',
      dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
      fixedFields: [
        fx('firstName', 'First Name', 'text', true, '1. Personal Information'),
        fx('identityDocumentDoc', 'Upload Identity Document', 'file', true, '3. Identity Verification')
      ]
    },
    {
      stepKey: 'bank-details', stepTitle: 'Organisation Bank Details', stepSubtitle: 'Step 3 of the application',
      dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
      fixedFields: [fx('ifscCode', 'IFSC Code', 'text', true, '1. Bank & Account Details')]
    }
  ]
};

const org = (changes: Partial<OtrStepRecord> = {}): OtrStepRecord =>
  ({ id: 1, status: 'Draft', organisationName: 'Company 1', organisationPan: 'ABCDE1234F', ...changes });
const person = (changes: Partial<OtrStepRecord> = {}): OtrStepRecord => ({ id: 2, status: 'Draft', firstName: 'Scheme', ...changes });
const bank = (changes: Partial<OtrStepRecord> = {}): OtrStepRecord => ({ id: 3, status: 'Draft', bankName: 'State Bank of India', ifscCode: 'SBIN0001234', ...changes });

const url = (path: string) => buildApiUrl(path);

describe('RegistrationShellComponent (OTR on /api/otr)', () => {
  let fixture: ComponentFixture<RegistrationShellComponent>;
  let component: RegistrationShellComponent;
  let backend: HttpTestingController;
  let errors: string[];

  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegistrationShellComponent],
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    }).compileComponents();

    errors = [];
    const notifications = TestBed.inject(NotificationService);
    notifications.error = (message: string) => { errors.push(message); };
    notifications.success = () => undefined;

    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegistrationShellComponent);
    component = fixture.componentInstance;
  });

  /** Answers the step re-reads (GET /otr/form/steps/{key}) made on opening a step: no change. */
  const flushStepReads = () => backend.match(r => r.url.includes('/otr/form/steps/')).forEach(r => r.flush(null));

  afterEach(() => {
    flushStepReads();
    backend.verify();
  });

  /** An empty answer, as ASP.NET sends for a step that was never saved (Ok(null) -> 204). */
  const empty = (req: TestRequest) => req.flush(null, { status: 204, statusText: 'No Content' });

  function start(records: { organisation?: OtrStepRecord | null; person?: OtrStepRecord | null; bank?: OtrStepRecord | null } = {}): void {
    fixture.detectChanges();
    backend.expectOne(url('/otr/form')).flush(FORM);
    // Dropdown data comes from /otr/lookups (OTR permission only), not from the masters.
    backend.expectOne(url('/otr/lookups')).flush({ sectors: [{ id: 3, name: 'Agriculture' }], districts: [{ id: 11, name: 'Jaipur', state: 'Rajasthan' }] });
    backend.expectNone(r => r.url.endsWith('/master/sectors') || r.url.endsWith('/master/districts'));
    const reply = (path: string, record: OtrStepRecord | null | undefined) => {
      const req = backend.expectOne(url(path));
      if (record) req.flush(record); else empty(req);
    };
    reply('/otr/me', records.organisation);
    reply('/otr/me/authorized-person', records.person);
    reply('/otr/me/bank-details', records.bank);
    fixture.detectChanges();
  }

  it('fills the sector and district dropdowns from /otr/lookups', () => {
    start();
    const lookups = TestBed.inject(OtrRegistrationService).lookups();
    expect(lookups.sectors).toEqual([{ id: 3, name: 'Agriculture' }]);
    expect(lookups.districts).toEqual([{ id: 11, name: 'Jaipur', state: 'Rajasthan' }]);
  });

  it('falls back to the masters when /otr/lookups fails', () => {
    fixture.detectChanges();
    backend.expectOne(url('/otr/form')).flush(FORM);
    backend.expectOne(url('/otr/lookups')).flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    backend.match(r => r.url.endsWith('/master/sectors')).forEach(r => r.flush([{ id: 3, sectorName: 'Agriculture', sectorCode: 'AGR', isActive: true }]));
    backend.match(r => r.url.endsWith('/master/districts')).forEach(r => r.flush([{ id: 11, name: 'Jaipur', state: 'Rajasthan', isActive: true }]));
    for (const path of ['/otr/me', '/otr/me/authorized-person', '/otr/me/bank-details']) empty(backend.expectOne(url(path)));
    // A 403 may also reload the permissions.
    backend.match(r => r.url.includes('/auth/permissions')).forEach(r => r.flush({ tables: [] }));
    expect(TestBed.inject(OtrRegistrationService).lookups().sectors).toEqual([{ id: 3, name: 'Agriculture' }]);
  });

  it('renders the fields of GET /otr/form and starts at the first unsaved step', () => {
    start({ organisation: org() });
    expect(component.loading()).toBe(false);
    expect(component.activeStep()).toBe(2);
    expect(component.values()['organisation']['organisationName']).toBe('Company 1');
    expect(fixture.nativeElement.textContent).toContain('First Name');
    expect(component.completedSteps()).toEqual([1]);
  });

  it('saves the step with PUT on Next Step and moves on when the backend accepts it', () => {
    start();
    const step = component.form()!.steps[0];
    component.onValueChange(step, 'organisationName', 'Company 1');
    component.onValueChange(step, 'organisationPan', 'abcde1234f');
    component.nextStep();

    const req = backend.expectOne(url('/otr/me/organisation'));
    expect(req.request.method).toBe('PUT');
    // Sent as typed: the backend trims and upper-cases.
    expect(req.request.body['organisationName']).toBe('Company 1');
    expect(req.request.body['organisationPan']).toBe('abcde1234f');
    expect('panCardDoc' in req.request.body).toBe(false);
    req.flush(org());

    expect(component.activeStep()).toBe(2);
    expect(component.values()['organisation']['organisationPan']).toBe('ABCDE1234F');
  });

  it('stays on the step and shows the backend messages under the fields on 400', () => {
    start();
    component.nextStep();
    backend.expectOne(url('/otr/me/organisation')).flush(
      { success: false, code: 'VALIDATION_FAILED', message: 'Validation failed.', errors: [{ code: 'VALIDATION_ERROR', field: 'OrganisationName', message: 'Organisation name is required.' }] },
      { status: 400, statusText: 'Bad Request' }
    );
    fixture.detectChanges();

    expect(component.activeStep()).toBe(1);
    expect(component.activeErrors()).toEqual({ organisationName: 'Organisation name is required.' });
    expect(fixture.nativeElement.textContent).toContain('Organisation name is required.');
    expect(errors[0]).toContain('Organisation Details');

    component.onValueChange(component.form()!.steps[0], 'organisationName', 'Company 1');
    expect(component.activeErrors()['organisationName']).toBeUndefined();
  });

  it('shows ASP.NET model binding errors (ProblemDetails) under their fields too', () => {
    start();
    component.nextStep();
    backend.expectOne(url('/otr/me/organisation')).flush(
      {
        title: 'One or more validation errors occurred.', status: 400,
        errors: { OrganisationPan: ['The OrganisationPan field is required.'], request: ['The request field is required.'] }
      },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(component.activeErrors()).toEqual({ organisationPan: 'The OrganisationPan field is required.' });
  });

  it('uploads a document by its document type and re-reads the record of its step', () => {
    start({ organisation: org() });
    expect(component.activeStep()).toBe(2);
    const field = stepFields(component.form()!.steps[1]).find(f => f.key === 'identityDocumentDoc')!;
    const file = new File(['%PDF-1.4'], 'id.pdf', { type: 'application/pdf' });
    component.uploadDocument(field, file);

    const upload = backend.expectOne(url('/otr/me/documents/identity-document'));
    expect(upload.request.method).toBe('POST');
    expect((upload.request.body as FormData).get('file')).toBeInstanceOf(File);
    upload.flush(org());
    backend.expectOne(url('/otr/me/authorized-person')).flush(person({ firstName: '', identityDocumentFileName: 'id.pdf' }));

    expect(component.documents()['identityDocumentDoc']?.fileName).toBe('id.pdf');
    expect(component.uploadingField()).toBeNull();
  });

  it('shows an upload error from the backend under the field', () => {
    start();
    const field = stepFields(component.form()!.steps[0]).find(f => f.key === 'panCardDoc')!;
    component.uploadDocument(field, new File(['x'], 'pan.exe'));
    backend.expectOne(url('/otr/me/documents/pan-card')).flush(
      { success: false, code: 'BAD_REQUEST', message: 'Organisation PAN Card: only .PDF, .JPG, .JPEG, .PNG files are allowed.' },
      { status: 400, statusText: 'Bad Request' }
    );
    expect(component.activeErrors()['panCardDoc']).toContain('only .PDF');
  });

  it('submits the declaration and opens the success dialog', () => {
    start({ organisation: org(), person: person(), bank: bank() });
    expect(component.activeStep()).toBe(4);
    component.onDeclarationChange(true);
    component.submit();
    const req = backend.expectOne(url('/otr/me/submit'));
    expect(req.request.body).toEqual({ declarationAccepted: true });
    req.flush(org({ status: 'Submitted' }));
    backend.expectOne(url('/otr/me')).flush(org({ status: 'Submitted' }));
    backend.expectOne(url('/otr/me/authorized-person')).flush(person({ status: 'Submitted' }));
    backend.expectOne(url('/otr/me/bank-details')).flush(bank({ status: 'Submitted' }));

    expect(component.submittedOpen()).toBe(true);
    expect(component.readOnly()).toBe(true);
  });

  it('shows the declaration error the backend returns on submit', () => {
    start({ organisation: org(), person: person(), bank: bank() });
    component.submit();
    backend.expectOne(url('/otr/me/submit')).flush(
      { code: 'VALIDATION_FAILED', message: 'Validation failed.', errors: [{ field: 'DeclarationAccepted', message: 'Declaration must be accepted to submit.' }] },
      { status: 400, statusText: 'Bad Request' }
    );
    fixture.detectChanges();
    expect(component.submittedOpen()).toBe(false);
    expect(component.generalErrors()['declarationAccepted']).toBe('Declaration must be accepted to submit.');
    expect(fixture.nativeElement.textContent).toContain('Declaration must be accepted to submit.');
  });

  it('opens a submitted registration read-only on the review step', () => {
    start({ organisation: org({ status: 'Submitted' }), person: person({ status: 'Submitted' }), bank: bank({ status: 'Submitted' }) });
    expect(component.activeStep()).toBe(4);
    expect(component.readOnly()).toBe(true);
    component.goToStep(1);
    expect(component.activeStep()).toBe(1);
    backend.expectNone(url('/otr/me/organisation'));
  });

  it('re-reads the open step and draws FormManager fields published after the form was loaded', () => {
    start();
    const req = backend.expectOne(url('/otr/form/steps/organisation'));
    const step = FORM.steps[0];
    req.flush({
      ...step,
      dynamicFormId: 12, dynamicFormVersion: 1, hasDynamicForm: true,
      dynamicSchema: { title: 'Extra', fields: [{ fieldKey: 'cinNumber', label: 'CIN Number', fieldType: 'text', isRequired: false, displayOrder: 1, colSpan: 6 }] }
    });
    fixture.detectChanges();
    expect(component.form()!.steps[0].dynamicFormId).toBe(12);
    expect(component.values()['organisation']['dynamic.cinNumber']).toBe('');
    expect(fixture.nativeElement.textContent).toContain('CIN Number');
  });

  it('asks for a reason and saves a change to a saved step with PATCH', () => {
    start({ organisation: org(), person: person() });
    component.goToStep(1);
    flushStepReads();
    const step = component.form()!.steps[0];

    // Nothing changed: no call, the screen just moves on.
    component.nextStep();
    backend.expectNone(url('/otr/me/organisation'));
    expect(component.activeStep()).toBe(2);

    component.goToStep(1);
    flushStepReads();
    component.onValueChange(step, 'organisationName', 'Company 2');
    component.nextStep();
    expect(component.reasonOpen()).toBe(true);
    backend.expectNone(url('/otr/me/organisation'));

    component.confirmReason(); // no reason yet
    expect(component.reasonOpen()).toBe(true);

    component.changeReason.set('Name changed');
    component.confirmReason();
    const req = backend.expectOne(url('/otr/me/organisation'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body['reason']).toBe('Name changed');
    expect(req.request.body['organisationName']).toBe('Company 2');
    req.flush(org({ organisationName: 'Company 2' }));
    expect(component.activeStep()).toBe(2);
  });

  it('shows the change history of the registration', () => {
    start({ organisation: org() });
    expect(component.hasSavedSteps()).toBe(true);
    component.openHistory();
    backend.expectOne(url('/otr/me/update-logs')).flush([
      { id: 1, section: 'OrganisationDetails', action: 'Create', targetRecordId: 1, reason: 'Initial creation', changedFields: ['*'], createdAt: '2026-01-02T10:00:00Z' }
    ]);
    expect(component.historyOpen()).toBe(true);
    expect(component.historyLogs().length).toBe(1);
  });

  it('explains a missing permission instead of showing an empty form', () => {
    fixture.detectChanges();
    backend.expectOne(url('/otr/form')).flush({ code: 'FORBIDDEN', message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    // The parallel calls were cancelled when the form request failed; a 403 may also reload the permissions.
    backend.match(() => true).filter(r => !r.cancelled).forEach(r => r.flush(null));
    expect(component.loadError()).toContain('does not have access');
  });
});
