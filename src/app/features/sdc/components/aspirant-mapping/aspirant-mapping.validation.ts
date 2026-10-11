import { AspirantFormData } from '../../config/aspirant-form.config';
import {
  REGEX_PATTERNS,
  isValidMobile,
  isValidPincode,
  isValidIfsc,
  isValidBankAccount
} from '../../../../shared/utils/validators.util';

/** Fields read by the Step 1 (Identity) validation. */
export type IdentityStepData = Pick<
  AspirantFormData,
  'aspirantName' | 'aadhaarNo' | 'janaadhaarId' | 'otherIdType' | 'otherIdNo'
>;

/** Fields read by the Step 2 (Address & Contact) validation. */
export type AddressStepData = Pick<
  AspirantFormData,
  'mobileNo' | 'altMobileNo' | 'permCity' | 'permPincode' | 'commPincode'
>;

/** Fields read by the Step 3 (Bank) validation. */
export type BankStepData = Pick<AspirantFormData, 'ifscCode' | 'bankAccountNo'>;

/** Everything the final submit validation needs. */
export type SubmitValidationData = IdentityStepData & AddressStepData & BankStepData;

/** A failed submit validation: the message to show and the wizard step that owns the field. */
export interface SubmitValidationError {
  message: string;
  step: number;
}

const AADHAAR_12_DIGITS = /^[0-9]{12}$/;
const JAN_AADHAAR_10_DIGITS = /^[0-9]{10}$/;

/** Step 1: returns the first error message, or null when the identity step is valid. */
export function validateIdentityStep(data: IdentityStepData): string | null {
  if (!data.aspirantName) {
    return 'Please provide the Aspirant Name.';
  }
  if (!data.aadhaarNo) {
    return 'Aadhaar number is mandatory.';
  }
  if (!AADHAAR_12_DIGITS.test(data.aadhaarNo)) {
    return 'Aadhaar number must be exactly 12 digits (numbers only, no spaces).';
  }
  if (data.janaadhaarId && !JAN_AADHAAR_10_DIGITS.test(data.janaadhaarId)) {
    return 'Jan Aadhaar ID must be exactly 10 digits.';
  }
  // Validate Other ID number based on selected type
  if (data.otherIdNo && data.otherIdType && data.otherIdType !== 'None') {
    const idVal = data.otherIdNo.trim().toUpperCase();
    const idType = data.otherIdType;
    if (idType === 'PAN Card') {
      if (!REGEX_PATTERNS.PAN.test(idVal)) {
        return 'PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).';
      }
    } else if (idType === 'Voter ID') {
      if (!REGEX_PATTERNS.VOTER_ID.test(idVal)) {
        return 'Voter ID (EPIC) must be 10 characters: 3 letters followed by 7 digits (e.g. ABC1234567).';
      }
    } else if (idType === 'Passport') {
      if (!REGEX_PATTERNS.PASSPORT.test(idVal)) {
        return 'Passport No. must be 8 characters: 1 letter followed by 7 digits (e.g. A1234567).';
      }
    } else if (idType === 'Driving License') {
      if (idVal.length < 10 || idVal.length > 16 || !REGEX_PATTERNS.DRIVING_LICENSE.test(idVal)) {
        return 'Driving License must be 10–16 alphanumeric characters (e.g. RJ0120110012345).';
      }
    }
  }
  return null;
}

/** Step 2: returns the first error message, or null when the address & contact step is valid. */
export function validateAddressStep(data: AddressStepData): string | null {
  if (!data.mobileNo) {
    return 'Mobile number is mandatory.';
  }
  if (!isValidMobile(data.mobileNo)) {
    return 'Mobile number must be 10 digits starting with 6, 7, 8, or 9.';
  }
  if (data.altMobileNo && !isValidMobile(data.altMobileNo)) {
    return 'Alternate mobile number must be 10 digits starting with 6, 7, 8, or 9.';
  }
  if (!data.permCity || !data.permPincode) {
    return 'Please provide complete permanent address (Village/City and Pincode).';
  }
  if (!isValidPincode(data.permPincode)) {
    return 'Permanent address Pincode must be a valid 6-digit code.';
  }
  if (data.commPincode && !isValidPincode(data.commPincode)) {
    return 'Communication address Pincode must be a valid 6-digit code.';
  }
  return null;
}

/**
 * Validation run when the user clicks "Proceed" on the given (current) step.
 * Steps 3 and 4 have no gate; they are only checked on final submit.
 */
export function validateStepBeforeAdvance(
  currentStep: number,
  data: IdentityStepData & AddressStepData
): string | null {
  if (currentStep === 1) {
    return validateIdentityStep(data);
  }
  if (currentStep === 2) {
    return validateAddressStep(data);
  }
  return null;
}

/** Final validation before submitting; reports which step the offending field lives on. */
export function validateForSubmit(data: SubmitValidationData): SubmitValidationError | null {
  if (!data.aspirantName) {
    return { message: 'Aspirant name is mandatory.', step: 1 };
  }
  if (!data.aadhaarNo || !AADHAAR_12_DIGITS.test(data.aadhaarNo)) {
    return { message: 'Aadhaar number must be exactly 12 digits.', step: 1 };
  }
  if (!data.mobileNo || !isValidMobile(data.mobileNo)) {
    return { message: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9.', step: 2 };
  }
  if (data.ifscCode && !isValidIfsc(data.ifscCode)) {
    return {
      message: 'IFSC Code must be 11 characters: 4 letters, 0, then 6 alphanumerics (e.g. SBIN0001234).',
      step: 3
    };
  }
  if (data.bankAccountNo && !isValidBankAccount(data.bankAccountNo)) {
    return { message: 'Bank account number must be 9 to 18 digits.', step: 3 };
  }
  return null;
}
