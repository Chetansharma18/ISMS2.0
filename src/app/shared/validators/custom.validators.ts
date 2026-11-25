import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPan, isValidGstin, isValidMobile, isValidPincode, isValidIfsc } from '../utils/validators.util';

export class CustomValidators {
  static pan(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return isValidPan(control.value) ? null : { invalidPan: { value: control.value } };
    };
  }

  static gstin(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return isValidGstin(control.value) ? null : { invalidGstin: { value: control.value } };
    };
  }

  static mobile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return isValidMobile(control.value) ? null : { invalidMobile: { value: control.value } };
    };
  }

  static pincode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return isValidPincode(control.value) ? null : { invalidPincode: { value: control.value } };
    };
  }

  static ifsc(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return isValidIfsc(control.value) ? null : { invalidIfsc: { value: control.value } };
    };
  }
}
