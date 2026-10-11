import { describe, it, expect } from 'vitest';
import {
  AddressStepData,
  IdentityStepData,
  SubmitValidationData,
  validateAddressStep,
  validateForSubmit,
  validateIdentityStep,
  validateStepBeforeAdvance
} from './aspirant-mapping.validation';

const validIdentity = (): IdentityStepData => ({
  aspirantName: 'Rahul Sharma',
  aadhaarNo: '123456789012',
  janaadhaarId: '',
  otherIdType: 'None',
  otherIdNo: ''
});

const validAddress = (): AddressStepData => ({
  mobileNo: '9876543210',
  altMobileNo: '',
  permCity: 'Jaipur',
  permPincode: '302001',
  commPincode: ''
});

const validSubmit = (): SubmitValidationData => ({
  ...validIdentity(),
  ...validAddress(),
  ifscCode: '',
  bankAccountNo: ''
});

describe('validateIdentityStep', () => {
  it('accepts a minimal valid identity', () => {
    expect(validateIdentityStep(validIdentity())).toBeNull();
  });

  it('requires the aspirant name', () => {
    expect(validateIdentityStep({ ...validIdentity(), aspirantName: '' })).toBe('Please provide the Aspirant Name.');
  });

  it('requires the Aadhaar number', () => {
    expect(validateIdentityStep({ ...validIdentity(), aadhaarNo: '' })).toBe('Aadhaar number is mandatory.');
  });

  it('rejects Aadhaar numbers that are not exactly 12 digits', () => {
    const msg = 'Aadhaar number must be exactly 12 digits (numbers only, no spaces).';
    expect(validateIdentityStep({ ...validIdentity(), aadhaarNo: '12345678901' })).toBe(msg);
    expect(validateIdentityStep({ ...validIdentity(), aadhaarNo: '1234567890123' })).toBe(msg);
    expect(validateIdentityStep({ ...validIdentity(), aadhaarNo: '1234 5678 9012' })).toBe(msg);
    expect(validateIdentityStep({ ...validIdentity(), aadhaarNo: '12345678901A' })).toBe(msg);
  });

  it('checks the aspirant name before the Aadhaar number', () => {
    expect(validateIdentityStep({ ...validIdentity(), aspirantName: '', aadhaarNo: '' })).toBe(
      'Please provide the Aspirant Name.'
    );
  });

  it('treats Jan Aadhaar as optional but exactly 10 digits when given', () => {
    expect(validateIdentityStep({ ...validIdentity(), janaadhaarId: '1234567890' })).toBeNull();
    expect(validateIdentityStep({ ...validIdentity(), janaadhaarId: '12345' })).toBe(
      'Jan Aadhaar ID must be exactly 10 digits.'
    );
  });

  it('ignores the other ID number when the type is None or empty', () => {
    expect(validateIdentityStep({ ...validIdentity(), otherIdType: 'None', otherIdNo: '!!' })).toBeNull();
    expect(validateIdentityStep({ ...validIdentity(), otherIdType: '', otherIdNo: '!!' })).toBeNull();
  });

  it('ignores the other ID type when no number is entered', () => {
    expect(validateIdentityStep({ ...validIdentity(), otherIdType: 'PAN Card', otherIdNo: '' })).toBeNull();
  });

  it('validates PAN (case-insensitive, trimmed)', () => {
    const base = { ...validIdentity(), otherIdType: 'PAN Card' };
    expect(validateIdentityStep({ ...base, otherIdNo: 'ABCDE1234F' })).toBeNull();
    expect(validateIdentityStep({ ...base, otherIdNo: ' abcde1234f ' })).toBeNull();
    expect(validateIdentityStep({ ...base, otherIdNo: 'ABCDE12345' })).toBe(
      'PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).'
    );
  });

  it('validates Voter ID', () => {
    const base = { ...validIdentity(), otherIdType: 'Voter ID' };
    expect(validateIdentityStep({ ...base, otherIdNo: 'ABC1234567' })).toBeNull();
    expect(validateIdentityStep({ ...base, otherIdNo: 'AB12345678' })).toBe(
      'Voter ID (EPIC) must be 10 characters: 3 letters followed by 7 digits (e.g. ABC1234567).'
    );
  });

  it('validates Passport', () => {
    const base = { ...validIdentity(), otherIdType: 'Passport' };
    expect(validateIdentityStep({ ...base, otherIdNo: 'A1234567' })).toBeNull();
    expect(validateIdentityStep({ ...base, otherIdNo: '12345678' })).toBe(
      'Passport No. must be 8 characters: 1 letter followed by 7 digits (e.g. A1234567).'
    );
  });

  it('validates Driving License length and format', () => {
    const base = { ...validIdentity(), otherIdType: 'Driving License' };
    const msg = 'Driving License must be 10–16 alphanumeric characters (e.g. RJ0120110012345).';
    expect(validateIdentityStep({ ...base, otherIdNo: 'RJ0120110012345' })).toBeNull();
    expect(validateIdentityStep({ ...base, otherIdNo: 'RJ01234' })).toBe(msg); // too short
    expect(validateIdentityStep({ ...base, otherIdNo: 'RJ012011001234567' })).toBe(msg); // too long
    expect(validateIdentityStep({ ...base, otherIdNo: 'ABCDEFGHIJ' })).toBe(msg); // bad pattern
  });

  it('does not validate unknown other ID types', () => {
    expect(validateIdentityStep({ ...validIdentity(), otherIdType: 'Ration Card', otherIdNo: '??' })).toBeNull();
  });
});

describe('validateAddressStep', () => {
  it('accepts a valid address & contact set', () => {
    expect(validateAddressStep(validAddress())).toBeNull();
  });

  it('requires the mobile number', () => {
    expect(validateAddressStep({ ...validAddress(), mobileNo: '' })).toBe('Mobile number is mandatory.');
  });

  it('rejects malformed mobile numbers', () => {
    const msg = 'Mobile number must be 10 digits starting with 6, 7, 8, or 9.';
    expect(validateAddressStep({ ...validAddress(), mobileNo: '5876543210' })).toBe(msg);
    expect(validateAddressStep({ ...validAddress(), mobileNo: '98765' })).toBe(msg);
  });

  it('validates the alternate mobile only when provided', () => {
    expect(validateAddressStep({ ...validAddress(), altMobileNo: '9123456789' })).toBeNull();
    expect(validateAddressStep({ ...validAddress(), altMobileNo: '1234567890' })).toBe(
      'Alternate mobile number must be 10 digits starting with 6, 7, 8, or 9.'
    );
  });

  it('requires permanent city and pincode', () => {
    const msg = 'Please provide complete permanent address (Village/City and Pincode).';
    expect(validateAddressStep({ ...validAddress(), permCity: '' })).toBe(msg);
    expect(validateAddressStep({ ...validAddress(), permPincode: '' })).toBe(msg);
  });

  it('rejects an invalid permanent pincode', () => {
    const msg = 'Permanent address Pincode must be a valid 6-digit code.';
    expect(validateAddressStep({ ...validAddress(), permPincode: '30200' })).toBe(msg);
    expect(validateAddressStep({ ...validAddress(), permPincode: '012345' })).toBe(msg);
  });

  it('validates the communication pincode only when provided', () => {
    expect(validateAddressStep({ ...validAddress(), commPincode: '302001' })).toBeNull();
    expect(validateAddressStep({ ...validAddress(), commPincode: '1234' })).toBe(
      'Communication address Pincode must be a valid 6-digit code.'
    );
  });
});

describe('validateStepBeforeAdvance', () => {
  it('runs identity validation on step 1', () => {
    const data = { ...validIdentity(), ...validAddress(), aspirantName: '' };
    expect(validateStepBeforeAdvance(1, data)).toBe('Please provide the Aspirant Name.');
  });

  it('runs address validation on step 2', () => {
    const data = { ...validIdentity(), ...validAddress(), mobileNo: '' };
    expect(validateStepBeforeAdvance(2, data)).toBe('Mobile number is mandatory.');
  });

  it('does not gate steps 1/2 on the other step\'s fields', () => {
    const invalidAddress = { ...validIdentity(), ...validAddress(), mobileNo: '' };
    expect(validateStepBeforeAdvance(1, invalidAddress)).toBeNull();
    const invalidIdentity = { ...validIdentity(), ...validAddress(), aspirantName: '' };
    expect(validateStepBeforeAdvance(2, invalidIdentity)).toBeNull();
  });

  it('does not gate steps 3 and 4', () => {
    const data = { ...validIdentity(), ...validAddress(), aspirantName: '', mobileNo: '' };
    expect(validateStepBeforeAdvance(3, data)).toBeNull();
    expect(validateStepBeforeAdvance(4, data)).toBeNull();
  });
});

describe('validateForSubmit', () => {
  it('accepts valid data with optional bank fields empty', () => {
    expect(validateForSubmit(validSubmit())).toBeNull();
  });

  it('accepts valid IFSC and bank account', () => {
    expect(validateForSubmit({ ...validSubmit(), ifscCode: 'SBIN0001234', bankAccountNo: '123456789012' })).toBeNull();
  });

  it('flags a missing name on step 1', () => {
    expect(validateForSubmit({ ...validSubmit(), aspirantName: '' })).toEqual({
      message: 'Aspirant name is mandatory.',
      step: 1
    });
  });

  it('flags missing or malformed Aadhaar on step 1', () => {
    const expected = { message: 'Aadhaar number must be exactly 12 digits.', step: 1 };
    expect(validateForSubmit({ ...validSubmit(), aadhaarNo: '' })).toEqual(expected);
    expect(validateForSubmit({ ...validSubmit(), aadhaarNo: '123' })).toEqual(expected);
  });

  it('flags a missing or malformed mobile on step 2', () => {
    const expected = { message: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9.', step: 2 };
    expect(validateForSubmit({ ...validSubmit(), mobileNo: '' })).toEqual(expected);
    expect(validateForSubmit({ ...validSubmit(), mobileNo: '1234567890' })).toEqual(expected);
  });

  it('flags a malformed IFSC on step 3', () => {
    expect(validateForSubmit({ ...validSubmit(), ifscCode: 'SBIN1001234' })).toEqual({
      message: 'IFSC Code must be 11 characters: 4 letters, 0, then 6 alphanumerics (e.g. SBIN0001234).',
      step: 3
    });
  });

  it('flags a malformed bank account on step 3', () => {
    expect(validateForSubmit({ ...validSubmit(), bankAccountNo: '12345678' })).toEqual({
      message: 'Bank account number must be 9 to 18 digits.',
      step: 3
    });
  });

  it('reports the earliest failing step first', () => {
    const data = { ...validSubmit(), aspirantName: '', mobileNo: '', ifscCode: 'bad' };
    expect(validateForSubmit(data)?.step).toBe(1);
  });
});
