import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../../core/http/api-error';
import { EoiApplication, EoiApplyDocument } from './eoi-apply.model';
import {
  acceptOf,
  answerErrors,
  answerText,
  formatsOf,
  initialAnswers,
  noticeHeader,
  paymentModeText,
  paymentReturnFrom,
  pendingBeforeFees,
  postToGateway,
  splitApplyDocuments,
  toWizardDocuments
} from './eoi-apply.util';

const doc = (id: number, name: string, category: string | null, mandatory: boolean, uploaded: boolean): EoiApplyDocument => ({
  requiredDocumentId: id, name, category, isMandatory: mandatory, comment: uploaded ? 'Signed copy' : null,
  documentId: uploaded ? 50 + id : null,
  file: uploaded ? { fileName: `${name}.pdf`, contentType: 'application/pdf', sizeBytes: 138849, uploadedAt: '2026-11-24T10:00:00Z', url: '' } : null,
  allowedExtensions: ['.pdf', 'jpg'], maxFileSizeMb: 5
});

describe('eoi-apply.util', () => {
  it('splits supporting documents from annexures and keeps the order', () => {
    const docs = [doc(1, 'Income Proof', null, true, true), doc(6, 'Annexure-1', 'Annexure', true, false), doc(2, 'PAN', 'Statutory', false, false)];
    const { supporting, annexures } = splitApplyDocuments(docs);
    expect(supporting.map(d => d.name)).toEqual(['Income Proof', 'PAN']);
    expect(annexures.map(d => d.name)).toEqual(['Annexure-1']);
  });

  it('shows the upload rules of each document', () => {
    const d = doc(1, 'Income Proof', null, true, false);
    expect(acceptOf(d)).toBe('.pdf,.jpg');
    expect(formatsOf(d)).toBe('PDF, JPG');
  });

  it('maps uploaded documents for the fee and receipt steps', () => {
    const [item, annexure] = toWizardDocuments([doc(1, 'Income Proof', null, true, true), doc(6, 'Annexure-1', 'Annexure', true, false)]);
    expect(item).toMatchObject({ id: 1, status: 'uploaded', fileName: 'Income Proof.pdf', fileSize: '136 KB', category: 'mandatory', comment: 'Signed copy' });
    expect(annexure).toMatchObject({ id: 6, status: 'pending', category: 'annexure' });
  });

  it('reads the scheme strip from the EOI, with exempted fees shown as such', () => {
    const header = noticeHeader({
      id: 1, refNo: 'R/1', schemeName: 'Scheme 1', schemeCategory: 'Rajvik', eoiCategory: null, description: null,
      publishedDate: '2026-11-24', closingDate: '2026-11-30', durationYears: 1, emdFee: 100000, processFee: 25000,
      isFeeExempted: true, myApplication: null
    });
    expect(header).toMatchObject({ publishedDate: '24/11/2026', closingDate: '30/11/2026', emdFee: 'Exempted', processFeeAmount: 0, eoiCategory: '' });
  });

  it('formats answers for the preview', () => {
    expect(answerText({ type: 'multiselect' }, ['A', 'B'])).toBe('A, B');
    expect(answerText({ type: 'checkbox' }, true)).toBe('Yes');
    expect(answerText({ type: 'datepicker' }, '2026-11-24')).toBe('24/11/2026');
    expect(answerText({ type: 'text' }, '')).toBe('-');
  });

  it('fills every question with an empty answer of its type', () => {
    const fields = [
      { key: 'a', type: 'text' }, { key: 'b', type: 'multiselect' }, { key: 'c', type: 'checkbox' }
    ].map(f => ({ ...f, label: f.key, mandatory: false, placeholder: null, helpText: null, options: [], section: '' }));
    expect(initialAnswers(fields, { a: 'saved' })).toEqual({ a: 'saved', b: [], c: false });
  });

  it('maps the backend answer errors to their questions', () => {
    const error = new ApiError(400, 'Validation failed', undefined, [], undefined, undefined, [
      { field: 'answers.turnover', message: 'Turnover is required.' },
      { field: 'declarationAccepted', message: 'Accept it.' }
    ]);
    expect(answerErrors(error)).toEqual({ turnover: 'Turnover is required.' });
  });

  it('reads the RPP return parameters from the wizard URL', () => {
    expect(paymentReturnFrom({ eoiId: '1' })).toBeNull();
    expect(paymentReturnFrom({ eoiId: '1', payment: 'emd', prn: 'PRN123', result: 'success' }))
      .toEqual({ fee: 'emd', prn: 'PRN123', result: 'success', message: '' });
    expect(paymentReturnFrom({ payment: 'other', result: 'cancelled', message: ' Cancelled by user ' }))
      .toEqual({ fee: null, prn: null, result: 'cancelled', message: 'Cancelled by user' });
  });

  it('names the payment mode RPP reported', () => {
    expect(paymentModeText({ paymentMode: 'UPI' })).toBe('RPP (UPI)');
    expect(paymentModeText(null)).toBe('Rajasthan Payment Platform (RPP)');
  });

  it('posts the prepared fields to the gateway', () => {
    const submitted: HTMLFormElement[] = [];
    const doc = document.implementation.createHTMLDocument('t');
    const original = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function (this: HTMLFormElement) { submitted.push(this); };
    try {
      postToGateway('https://rpptest.example/payments/v1/init', { MERCHANTCODE: 'M1', ENCDATA: 'abc' }, doc);
    } finally {
      HTMLFormElement.prototype.submit = original;
    }
    expect(submitted).toHaveLength(1);
    expect(submitted[0].method).toBe('post');
    expect(submitted[0].action).toBe('https://rpptest.example/payments/v1/init');
    expect(Array.from(submitted[0].querySelectorAll('input')).map(i => [i.name, i.value])).toEqual([['MERCHANTCODE', 'M1'], ['ENCDATA', 'abc']]);
  });

  it('lists what the backend still needs before the fee steps', () => {
    const app = {
      steps: [
        { key: 'organisation', title: 'Organisation Details', completed: true },
        { key: 'bank-details', title: 'Bank Details', completed: false },
        { key: 'processing-fee', title: 'Processing Fee', completed: false },
        { key: 'documents', title: 'Upload Documents', completed: false }
      ],
      documents: [doc(1, 'Income Proof', null, true, false), doc(2, 'PAN', null, false, false)]
    } as unknown as EoiApplication;
    expect(pendingBeforeFees(app)).toEqual(['Complete: Bank Details.', 'Upload the mandatory document: Income Proof.']);
  });
});
