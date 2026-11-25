import { describe, expect, it } from 'vitest';
import { OTR_GENERAL_ERRORS, OtrFullFormResponse, OtrLookups, OtrRecords } from './models/otr-api.model';
import {
  buildFormDef,
  currentStepNumber,
  displayValue,
  documentsFrom,
  fieldOptions,
  initialStepValues,
  isFieldVisible,
  isSubmitted,
  mapFieldErrors,
  savedStepNumbers,
  setStepValue,
  stepFields,
  toOtrFormData,
  toStepPayload
} from './otr-form.util';

const f = (fieldKey: string, label: string, fieldType: string, isRequired: boolean, sectionName: string) =>
  ({ fieldKey, label, fieldType, isRequired, sectionName });

/** The shape of GET /api/otr/form (OtrDynamicFormAttachmentService), trimmed. */
const RESPONSE: OtrFullFormResponse = {
  version: 1,
  title: 'Organization Registration',
  description: 'Please provide the required details to complete the registration process.',
  steps: [
    {
      stepKey: 'organisation', stepTitle: 'Organisation Details', stepSubtitle: 'Step 1 of the application',
      dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
      fixedFields: [
        f('organisationName', 'Organisation Name', 'text', true, '1. Basic Organisation Details'),
        f('preferredSectorIds', 'Preferred Sector', 'multiselect', true, '1. Basic Organisation Details'),
        f('isGstRegistered', 'GST Registered', 'select', true, '1. Basic Organisation Details'),
        f('gstNumber', 'GSTIN / GST Registration Number', 'text', false, '1. Basic Organisation Details'),
        f('gstCertificateDoc', 'GST Registration Certificate', 'file', false, '1. Basic Organisation Details'),
        f('dateOfRegistration', 'Date of Registration', 'date', true, '2. Registration & Documents'),
        f('organisationPan', 'Organisation PAN', 'text', true, '2. Registration & Documents'),
        f('panCardDoc', 'Organisation PAN Card', 'file', true, '2. Registration & Documents'),
        f('registeredState', 'State / UT', 'select', true, '4. Registered & Office Address'),
        f('registeredDistrict', 'District', 'select', true, '4. Registered & Office Address'),
        f('officeSameAsRegistered', 'Office address is the same as registered address', 'checkbox', false, '4. Registered & Office Address'),
        f('officeAddress', 'Office Address', 'textarea', false, '4. Registered & Office Address'),
        f('officeDistrict', 'District', 'select', false, '4. Registered & Office Address'),
        f('officeState', 'State / UT', 'select', false, '4. Registered & Office Address')
      ]
    },
    {
      stepKey: 'authorized-person', stepTitle: 'Authorized Person Details', stepSubtitle: 'Step 2 of the application',
      dynamicFormId: 7, dynamicFormVersion: 2, hasDynamicForm: true,
      dynamicSchema: {
        title: 'Extra', fields: [
          { fieldKey: 'alternateMobile', label: 'Alternate Mobile', fieldType: 'phone', isRequired: false, displayOrder: 1, colSpan: 6, sectionName: 'Extra' }
        ]
      },
      fixedFields: [
        f('firstName', 'First Name', 'text', true, '1. Personal Information'),
        f('identityDocumentType', 'Identity Document Type', 'select', true, '3. Identity Verification'),
        f('identityDocumentDoc', 'Upload Identity Document', 'file', true, '3. Identity Verification')
      ]
    },
    {
      stepKey: 'bank-details', stepTitle: 'Organisation Bank Details', stepSubtitle: 'Step 3 of the application',
      dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
      fixedFields: [
        f('bankName', 'Name of the Bank', 'select', true, '1. Bank & Account Details'),
        f('cancelledChequeDoc', 'Upload Cancelled Cheque / Bank Passbook', 'file', true, '2. Bank Verification Document')
      ]
    }
  ]
};

const LOOKUPS: OtrLookups = {
  sectors: [{ id: 3, name: 'Agriculture' }, { id: 9, name: 'IT Services' }],
  districts: [{ id: 11, name: 'Jaipur', state: 'Rajasthan' }, { id: 12, name: 'Ajmer', state: 'Rajasthan' }]
};

const FORM = buildFormDef(RESPONSE, LOOKUPS);
const [ORG, PERSON, BANK] = FORM.steps;
const field = (step: typeof ORG, key: string) => stepFields(step).find(x => x.key === key)!;

describe('otr-form.util (backend OTR form)', () => {
  it('builds the steps, sections and required markers from GET /otr/form and adds Preview & Submit', () => {
    expect(FORM.steps.map(s => s.key)).toEqual(['organisation', 'authorized-person', 'bank-details', 'preview']);
    expect(FORM.steps[3].kind).toBe('review');
    expect(FORM.steps[3].declaration).toBeTruthy();
    expect(ORG.sections.map(s => s.title)).toEqual([
      '1. Basic Organisation Details', '2. Registration & Documents', '4. Registered & Office Address'
    ]);
    expect(field(ORG, 'organisationName').required).toBe(true);
    expect(field(ORG, 'gstNumber').required).toBe(false);
    expect(field(ORG, 'panCardDoc').documentType).toBe('pan-card');
    expect(field(ORG, 'preferredSectorIds').options).toEqual([{ value: '3', label: 'Agriculture' }, { value: '9', label: 'IT Services' }]);
  });

  it('adds the FormManager fields of a step and its dynamic form id', () => {
    expect(PERSON.dynamicFormId).toBe(7);
    const extra = field(PERSON, 'dynamic.alternateMobile');
    expect(extra.dynamic).toBe(true);
    expect(extra.type).toBe('tel');
  });

  it('shows GST and office fields only when they apply, and districts of the chosen state', () => {
    const values = initialStepValues(ORG, null);
    expect(values['isGstRegistered']).toBe('No');
    expect(isFieldVisible(field(ORG, 'gstNumber'), values)).toBe(false);
    expect(isFieldVisible(field(ORG, 'gstNumber'), { ...values, isGstRegistered: 'Yes' })).toBe(true);
    expect(isFieldVisible(field(ORG, 'officeAddress'), { ...values, officeSameAsRegistered: true })).toBe(false);
    expect(fieldOptions(field(ORG, 'registeredDistrict'), values).map(o => o.value)).toEqual(['Ajmer', 'Jaipur']);

    const moved = setStepValue(ORG, { ...values, registeredDistrict: 'Jaipur' }, 'registeredState', 'Goa');
    // Goa has no District Master rows: the typed or chosen value is kept for the backend to judge.
    expect(moved['registeredDistrict']).toBe('Jaipur');
  });

  it('builds the request body the backend expects (booleans, sector ids, district id, nulls)', () => {
    const values = {
      ...initialStepValues(ORG, null),
      organisationName: 'Company 1',
      preferredSectorIds: ['3', '9'],
      isGstRegistered: 'Yes',
      gstNumber: '08abcde1234f1z5',
      organisationPan: 'abcde1234f',
      registeredDistrict: 'Jaipur',
      officeSameAsRegistered: true
    };
    const body = toStepPayload(ORG, values, LOOKUPS);
    expect(body['organisationName']).toBe('Company 1');
    expect(body['preferredSectorIds']).toEqual([3, 9]);
    expect(body['isGstRegistered']).toBe(true);
    expect(body['gstNumber']).toBe('08abcde1234f1z5');
    expect(body['organisationPan']).toBe('abcde1234f');
    expect(body['registeredDistrict']).toBe('Jaipur');
    expect(body['registeredDistrictId']).toBe(11);
    expect(body['officeSameAsRegistered']).toBe(true);
    // Hidden office fields go empty; the backend copies the registered address.
    expect(body['officeAddress']).toBeNull();
    // An empty date goes as null: the backend reports it.
    expect(body['dateOfRegistration']).toBeNull();
    expect('panCardDoc' in body).toBe(false);
    expect(body['dynamicFormId']).toBeNull();

    const hidden = toStepPayload(ORG, { ...values, isGstRegistered: 'No' }, LOOKUPS);
    expect(hidden['gstNumber']).toBeNull();
    expect(hidden['isGstRegistered']).toBe(false);
  });

  it('sends FormManager answers in dynamicFormAnswers with the form id and version', () => {
    const values = { ...initialStepValues(PERSON, null), firstName: 'Scheme', 'dynamic.alternateMobile': '9829012345' };
    const body = toStepPayload(PERSON, values, LOOKUPS);
    expect(body['dynamicFormId']).toBe(7);
    expect(body['dynamicFormVersion']).toBe(2);
    expect(body['dynamicFormAnswers']).toEqual({ alternateMobile: '9829012345' });
    expect('dynamic.alternateMobile' in body).toBe(false);
  });

  it('reads saved records back into screen values', () => {
    const values = initialStepValues(ORG, {
      id: 4, status: 'Draft', organisationName: 'Company 1', preferredSectorIds: [3], isGstRegistered: true,
      dateOfRegistration: '2022-04-15', officeSameAsRegistered: true
    });
    expect(values['organisationName']).toBe('Company 1');
    expect(values['preferredSectorIds']).toEqual(['3']);
    expect(values['isGstRegistered']).toBe('Yes');
    expect(values['dateOfRegistration']).toBe('2022-04-15');
    expect(values['officeSameAsRegistered']).toBe(true);
    expect(displayValue(field(ORG, 'preferredSectorIds'), values['preferredSectorIds'], values)).toBe('Agriculture');

    // A record created by an upload only (no name yet) shows the screen defaults, not the backend's blanks.
    const uploadOnly = initialStepValues(ORG, { id: 4, status: 'Draft', organisationName: '', dateOfRegistration: '0001-01-01', isGstRegistered: false });
    expect(uploadOnly['dateOfRegistration']).toBe('');
    expect(uploadOnly['registeredState']).toBe('Rajasthan');
  });

  it('works out saved steps, the current step and the submitted state from the records', () => {
    const none: OtrRecords = { organisation: null, 'authorized-person': null, 'bank-details': null };
    expect(currentStepNumber(FORM, none)).toBe(1);

    const someSaved: OtrRecords = {
      organisation: { id: 1, status: 'Draft', organisationName: 'Company 1' },
      'authorized-person': null,
      'bank-details': { id: 3, status: 'Draft', bankName: '' }
    };
    expect(savedStepNumbers(FORM, someSaved)).toEqual([1]);
    expect(currentStepNumber(FORM, someSaved)).toBe(2);

    const all: OtrRecords = {
      organisation: { id: 1, status: 'Submitted', organisationName: 'Company 1' },
      'authorized-person': { id: 2, status: 'Submitted', firstName: 'Scheme' },
      'bank-details': { id: 3, status: 'Submitted', bankName: 'State Bank of India' }
    };
    expect(currentStepNumber(FORM, all)).toBe(4);
    expect(isSubmitted(all)).toBe(true);
  });

  it('finds uploaded documents on the record of their step', () => {
    const docs = documentsFrom(FORM, {
      organisation: { id: 1, status: 'Draft', panCardFileName: 'pan.pdf', panCardUrl: '/api/otr/me/documents/pan-card' },
      'authorized-person': { id: 2, status: 'Draft', identityDocumentFileName: 'id.pdf' },
      'bank-details': { id: 3, status: 'Draft', cancelledChequeFileName: null }
    });
    expect(Object.keys(docs).sort()).toEqual(['identityDocumentDoc', 'panCardDoc']);
    expect(docs['panCardDoc'].fileName).toBe('pan.pdf');
  });

  it('places backend errors under their fields whatever casing or binding path they use', () => {
    const map = mapFieldErrors(
      [
        { field: 'OrganisationName', message: 'Organisation name is required.' },
        { field: '$.dateOfRegistration', message: 'The JSON value could not be converted to System.DateOnly.' },
        { field: 'RegisteredDistrictId', message: 'Bad district.' },
        { field: 'request', message: 'The request field is required.' }
      ],
      FORM,
      'organisation'
    );
    expect(map['organisation']).toEqual({
      organisationName: 'Organisation name is required.',
      dateOfRegistration: 'The JSON value could not be converted to System.DateOnly.',
      registeredDistrict: 'Bad district.'
    });
    expect(map[OTR_GENERAL_ERRORS]).toEqual({ request: 'The request field is required.' });

    const submit = mapFieldErrors([{ field: 'DeclarationAccepted', message: 'Declaration must be accepted to submit.' }], FORM);
    expect(submit[OTR_GENERAL_ERRORS]['declarationAccepted']).toContain('Declaration');
  });

  it('builds the older OtrFormData shape for the other screens', () => {
    const data = toOtrFormData(
      {
        organisation: {
          id: 1, status: 'Submitted', organisationName: 'Company 1', preferredSectorIds: [9], isGstRegistered: true,
          gstNumber: '08ABCDE1234F1Z5', organisationPan: 'ABCDE1234F', panCardFileName: 'pan.pdf', submittedAt: '2026-01-02T10:00:00Z'
        },
        'authorized-person': { id: 2, status: 'Submitted', firstName: 'Scheme', lastName: 'OIC', identityDocumentType: 'PAN Card', identityDocumentNumber: 'ABCPK1234F' },
        'bank-details': { id: 3, status: 'Submitted', bankName: 'State Bank of India', accountNumber: '3948201948201', ifscCode: 'SBIN0001234' }
      },
      FORM,
      LOOKUPS
    );
    expect(data.status).toBe('Submitted');
    expect(data.step1.fullName).toBe('Company 1');
    expect(data.step1.preferredSector).toBe('IT Services');
    expect(data.step1.gstRegistered).toBe('Yes');
    expect(data.step1.panCardDoc?.fileName).toBe('pan.pdf');
    expect(data.step3.name).toBe('Scheme OIC');
    expect(data.step3.pan).toBe('ABCPK1234F');
    expect(data.step4.accountNo).toBe('3948201948201');
    expect(BANK.key).toBe('bank-details');
  });
});
