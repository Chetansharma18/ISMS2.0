/*
 * Shapes of the applicant's EOI application API (`/api/eoi/apply`), as the backend sends them
 * (EoiApplicationDto and friends in EoiDtos.cs).
 */
import type { EoiOpenNotice } from '../../../tenders/services/eoi-config.model';

export interface EoiApplyFile {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  url: string;
}

/** One required document or annexure of the EOI, with what the applicant has uploaded for it. */
export interface EoiApplyDocument {
  requiredDocumentId: number | null;
  name: string;
  /** "Annexure" for annexures (Annexure Master), otherwise the Doc Master category or null. */
  category: string | null;
  isMandatory: boolean;
  comment: string | null;
  /** Id of the uploaded file (GET .../documents/{documentId}); null until uploaded. */
  documentId: number | null;
  file: EoiApplyFile | null;
  allowedExtensions: string[];
  maxFileSizeMb: number;
}

/** A question configured on the EOI (Configure EOI custom fields). */
export interface EoiCustomField {
  key: string;
  label: string;
  /** text | textarea | number | currency | email | phone | datepicker | dropdown | radio | multiselect | checkbox */
  type: string;
  mandatory: boolean;
  placeholder: string | null;
  helpText: string | null;
  options: string[];
  section: string;
}

export interface EoiStepStatus {
  key: string;
  title: string;
  completed: boolean;
}

/** A fee of the application (EoiFeeDto); `done` is true when paid or not payable. */
export interface EoiApplyFee {
  amount: number;
  required: boolean;
  done: boolean;
  prn: string | null;
  paidAt: string | null;
  /** From the successful RPP transaction, for the receipt. */
  rppTxnId?: string | null;
  paymentMode?: string | null;
  bankReference?: string | null;
}

export type EoiPaymentFee = EoiApplyFee;

/** POST .../payments/{fee}/initiate: post `formFields` to `targetUrl` to open RPP. */
export interface EoiPaymentInitiate {
  fee: string;
  prn: string;
  amount: number;
  targetUrl: string;
  formFields: Record<string, string>;
  htmlAutoSubmitForm: string;
}

export type EoiAnswerValue = string | number | boolean | string[] | null;

export interface EoiApplication {
  id: number;
  applicationNo: string;
  status: string;
  isEditable: boolean;
  notice: EoiOpenNotice;
  otrReferenceNo: string | null;
  /** The OTR copied into the application: one record per OTR step (organisation, authorized-person, bank-details). */
  profile: Record<string, Record<string, unknown> | undefined>;
  steps: EoiStepStatus[];
  processFee: EoiApplyFee;
  emd: EoiApplyFee & { mode: string; exemptionEligible: boolean; udyamNumber: string | null };
  documents: EoiApplyDocument[];
  /** Why the application cannot be submitted yet (empty when it can). */
  missingForSubmit: string[];
  declarationAccepted: boolean;
  createdAt: string;
  updatedAt: string | null;
  submittedAt: string | null;
  dynamicAnswers?: Record<string, EoiAnswerValue> | null;
  customFields?: EoiCustomField[] | null;
}
