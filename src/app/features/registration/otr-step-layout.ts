import {
  BANKS_MASTER,
  DESIGNATIONS_MASTER,
  IDENTITY_DOCUMENT_TYPES,
  NATURE_OF_ENTITIES,
  NSDC_PARTNER_TYPES,
  STATES_MASTER
} from './models/otr-form.model';
import { OtrCondition, OtrFieldType, OtrOption } from './models/otr-api.model';

/*
 * How the OTR screen draws the backend's fixed fields. GET /otr/form names the fields, their labels, types,
 * required flags and sections, but not the dropdown lists or which fields depend on another, so those display
 * settings live here, keyed by the backend field key. A field the backend adds that is not listed here is still
 * shown, with its own type. Nothing here accepts or rejects a value: the backend does every check.
 */

/** How a field's screen value is turned into the backend's JSON value (and back). */
export type OtrValueKind =
  /** text, sent as typed ('' when empty) */
  | 'text'
  /** a "Yes" / "No" select stored as a boolean (isGstRegistered) */
  | 'yesNo'
  /** a checkbox stored as a boolean */
  | 'flag'
  /** a multi select of master ids, sent as numbers (preferredSectorIds) */
  | 'ids'
  /** yyyy-MM-dd, sent as null when empty */
  | 'date'
  /** a district name; its DistrictMasters id is sent too, as `<key>Id` */
  | 'district'
  /** optional text sent as null when empty */
  | 'optionalText';

export interface OtrFieldLayout {
  type?: OtrFieldType;
  placeholder?: string;
  colSpan?: number;
  options?: readonly string[] | OtrOption[];
  /** Options from a master table, loaded at runtime. */
  optionsSource?: 'sectors' | 'districts';
  dependsOn?: string;
  visibleWhen?: OtrCondition;
  default?: string;
  transform?: 'upper';
  value?: OtrValueKind;
  /** File fields: the document type of /otr/me/documents/{documentType}. */
  documentType?: string;
}

const YES_NO = ['Yes', 'No'];
const GST_YES: OtrCondition = { field: 'isGstRegistered', equalTo: 'Yes' };
const MSME_YES: OtrCondition = { field: 'isMsmeRegistered', equalTo: 'Yes' };
const OFFICE_SEPARATE: OtrCondition = { field: 'officeSameAsRegistered', equalTo: 'false' };
const DOCS = { accept: '.pdf,.jpg,.jpeg,.png', maxSizeMb: 25 };

export const OTR_DOCUMENT_ACCEPT = DOCS.accept;
export const OTR_DOCUMENT_MAX_MB = DOCS.maxSizeMb;

export const OTR_FIELD_LAYOUT: Record<string, Record<string, OtrFieldLayout>> = {
  organisation: {
    organisationName: { placeholder: 'Enter organisation name' },
    natureOfEntity: { options: NATURE_OF_ENTITIES, placeholder: 'Select entity type' },
    preferredSectorIds: { optionsSource: 'sectors', value: 'ids', placeholder: 'Select preferred sector(s)' },
    nsdcPartner: { options: NSDC_PARTNER_TYPES, default: 'Not Applicable', placeholder: 'Select status' },
    isGstRegistered: { options: YES_NO, default: 'No', value: 'yesNo', placeholder: 'Select GST status' },
    gstNumber: { visibleWhen: GST_YES, transform: 'upper', value: 'optionalText', placeholder: '08ABCDE1234F1Z5' },
    gstCertificateDoc: { visibleWhen: GST_YES, documentType: 'gst-certificate' },
    isMsmeRegistered: { options: YES_NO, default: 'No', value: 'yesNo', placeholder: 'Select MSME status' },
    udyamNumber: { visibleWhen: MSME_YES, transform: 'upper', value: 'optionalText', placeholder: 'UDYAM-XX-00-0000000' },
    msmeCertificateDoc: { visibleWhen: MSME_YES, documentType: 'msme-certificate' },
    registrationNumber: { transform: 'upper', placeholder: 'Enter registration number' },
    dateOfRegistration: { value: 'date' },
    stateOfRegistration: { options: STATES_MASTER, default: 'Rajasthan', placeholder: 'Select state / UT' },
    organisationPan: { transform: 'upper', placeholder: 'Enter PAN number' },
    registrationCertificateDoc: { documentType: 'registration-certificate' },
    panCardDoc: { documentType: 'pan-card' },
    contactNumber: { placeholder: '10-digit mobile number' },
    organisationEmail: { placeholder: 'Enter official email' },
    website: { value: 'optionalText', placeholder: 'https://www.example.com' },
    registeredAddress: { colSpan: 2, placeholder: 'Address, locality, building name and number' },
    registeredState: { options: STATES_MASTER, default: 'Rajasthan', placeholder: 'Select state' },
    registeredDistrict: { optionsSource: 'districts', dependsOn: 'registeredState', value: 'district', placeholder: 'Select district' },
    registeredPinCode: { placeholder: '6-digit PIN code' },
    officeSameAsRegistered: { value: 'flag', colSpan: 2 },
    officeAddress: { visibleWhen: OFFICE_SEPARATE, colSpan: 2, value: 'optionalText', placeholder: 'Address, locality, building name and number' },
    officeState: { visibleWhen: OFFICE_SEPARATE, options: STATES_MASTER, default: 'Rajasthan', value: 'optionalText', placeholder: 'Select state' },
    officeDistrict: { visibleWhen: OFFICE_SEPARATE, optionsSource: 'districts', dependsOn: 'officeState', value: 'district', placeholder: 'Select district' },
    officePinCode: { visibleWhen: OFFICE_SEPARATE, value: 'optionalText', placeholder: '6-digit PIN code' }
  },
  'authorized-person': {
    firstName: { placeholder: 'Enter first name' },
    lastName: { value: 'optionalText', placeholder: 'Enter last name' },
    designation: { options: DESIGNATIONS_MASTER, value: 'optionalText', placeholder: 'Select designation' },
    mobileNumber: { placeholder: '10-digit mobile number' },
    emailAddress: { placeholder: 'Enter email address' },
    state: { options: STATES_MASTER, default: 'Rajasthan', value: 'optionalText', placeholder: 'Select state' },
    residentialAddress: { colSpan: 2, value: 'optionalText', placeholder: 'House / flat no., street, locality, city, PIN code' },
    identityDocumentType: { options: IDENTITY_DOCUMENT_TYPES, default: 'Aadhaar Card', placeholder: 'Select identity document' },
    identityDocumentNumber: { transform: 'upper', placeholder: 'Enter document number' },
    identityDocumentDoc: { documentType: 'identity-document' },
    authorizationLetterDoc: { documentType: 'authorization-letter' }
  },
  'bank-details': {
    bankName: { options: BANKS_MASTER, placeholder: 'Select bank' },
    branchName: { placeholder: 'Enter branch name' },
    accountHolderName: { placeholder: 'Enter account holder name' },
    accountNumber: { placeholder: 'Enter account number' },
    ifscCode: { transform: 'upper', placeholder: 'Enter IFSC code' },
    micrCode: { value: 'optionalText', placeholder: 'Enter MICR code (9 digits)' },
    cancelledChequeDoc: { colSpan: 2, documentType: 'cancelled-cheque' }
  }
};

/** The record field the backend fills only when the step itself was saved (an upload alone leaves it empty). */
export const OTR_STEP_SAVED_MARKER: Record<string, string> = {
  organisation: 'organisationName',
  'authorized-person': 'firstName',
  'bank-details': 'bankName'
};

/** The text of the declaration on "Preview & Submit"; the backend only receives whether it was accepted. */
export const OTR_DECLARATION =
  'I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge ' +
  'and belief. I understand that in the event of any information being found false or incorrect, my registration is ' +
  'liable to be cancelled.';
