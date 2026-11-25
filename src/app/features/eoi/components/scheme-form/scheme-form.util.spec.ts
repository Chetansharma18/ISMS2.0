import { describe, it, expect } from 'vitest';
import { Step1OrgDetails, Step3AuthorizedPerson } from '../../../registration/models/otr-form.model';
import { EoiDocumentItem } from './scheme-form.model';
import {
  countUploaded,
  emdPaymentModeLabel,
  filterDocsByCategory,
  formatFileSize,
  formatOfficeAddress,
  formatRegisteredAddress,
  formatResidenceAddress,
  numberToIndianWords,
  parseFeeAmount,
  procPaymentModeLabel
} from './scheme-form.util';

const doc = (id: number, category: EoiDocumentItem['category'], status: EoiDocumentItem['status']): EoiDocumentItem => ({
  id,
  name: `Doc ${id}`,
  description: '',
  fileName: '',
  fileSize: '',
  uploadedDate: '',
  isMandatory: true,
  status,
  category
});

describe('parseFeeAmount', () => {
  it('parses formatted rupee strings', () => {
    expect(parseFeeAmount('₹50,000', 1)).toBe(50000);
    expect(parseFeeAmount('₹2,000', 1)).toBe(2000);
  });

  it('falls back for empty, non-numeric or zero values', () => {
    expect(parseFeeAmount('', 2000)).toBe(2000);
    expect(parseFeeAmount(null, 2000)).toBe(2000);
    expect(parseFeeAmount('free', 50000)).toBe(50000);
    expect(parseFeeAmount('₹0', 50000)).toBe(50000);
  });
});

describe('numberToIndianWords', () => {
  it('handles zero', () => {
    expect(numberToIndianWords(0)).toBe('Zero');
  });

  it('spells out thousands', () => {
    expect(numberToIndianWords(2000)).toBe('Rupees Two Thousand Only');
  });

  it('uses lakh and hundred-and grouping', () => {
    expect(numberToIndianWords(150000)).toBe('Rupees One Lakh Fifty Thousand Only');
    expect(numberToIndianWords(52000)).toBe('Rupees Fifty Two Thousand Only');
    expect(numberToIndianWords(105)).toBe('Rupees One Hundred and Five Only');
  });

  it('uses crore', () => {
    expect(numberToIndianWords(10000000)).toBe('Rupees One Crore Only');
  });
});

describe('formatFileSize', () => {
  it('shows KB below 1 MB with a minimum of 1 KB', () => {
    expect(formatFileSize(10)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('shows MB with one decimal from 1 MB', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});

describe('document helpers', () => {
  const docs = [
    doc(1, 'mandatory', 'uploaded'),
    doc(2, 'mandatory', 'pending'),
    doc(3, 'annexure', 'uploaded'),
    doc(4, 'remaining', 'pending')
  ];

  it('returns every document for the all tab', () => {
    expect(filterDocsByCategory(docs, 'all')).toHaveLength(4);
  });

  it('filters by category', () => {
    expect(filterDocsByCategory(docs, 'mandatory').map(d => d.id)).toEqual([1, 2]);
    expect(filterDocsByCategory(docs, 'annexure').map(d => d.id)).toEqual([3]);
    expect(filterDocsByCategory(docs, 'remaining').map(d => d.id)).toEqual([4]);
  });

  it('counts uploaded documents', () => {
    expect(countUploaded(docs)).toBe(2);
    expect(countUploaded([])).toBe(0);
  });
});

describe('payment mode labels', () => {
  it('labels processing fee methods', () => {
    expect(procPaymentModeLabel('upi')).toBe('UPI (BHIM / Google Pay / PhonePe)');
    expect(procPaymentModeLabel('e-gras')).toBe('Cyber Treasury Rajasthan (e-GRAS)');
  });

  it('labels EMD methods including exemption', () => {
    expect(emdPaymentModeLabel('card')).toBe('Debit / Credit Card (Visa / RuPay)');
    expect(emdPaymentModeLabel('exemption')).toBe('MSME / Udyam 100% Exemption');
  });
});

describe('address helpers', () => {
  const org = {
    registeredAddress: '12 MI Road',
    registeredDistrict: 'Jaipur',
    registeredState: 'Rajasthan',
    registeredPincode: ' 302001 ',
    sameAsRegistered: false,
    officeAddress: '5 Tonk Road',
    officeDistrict: 'Jaipur',
    officeState: 'Rajasthan',
    officePincode: ''
  } as unknown as Step1OrgDetails;

  it('joins registered address parts with pincode', () => {
    expect(formatRegisteredAddress(org)).toBe('12 MI Road, Jaipur, Rajasthan - 302001');
  });

  it('returns a dash when no org is available', () => {
    expect(formatRegisteredAddress(null)).toBe('-');
    expect(formatOfficeAddress(undefined)).toBe('-');
  });

  it('reports same-as-registered office address', () => {
    expect(formatOfficeAddress({ ...org, sameAsRegistered: true })).toBe('Same as Registered Address');
  });

  it('joins office address parts without pincode', () => {
    expect(formatOfficeAddress(org)).toBe('5 Tonk Road, Jaipur, Rajasthan');
  });

  it('falls back for residence address', () => {
    expect(formatResidenceAddress({ residenceAddress: 'B-14' } as Step3AuthorizedPerson)).toBe('B-14');
    expect(formatResidenceAddress({ residenceAddress: '' } as Step3AuthorizedPerson)).toBe('-');
    expect(formatResidenceAddress(null)).toBe('-');
  });
});
