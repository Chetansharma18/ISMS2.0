import { FormFieldConfig, FormOption } from '../../../shared/components/form-sdc';
import { REGEX_PATTERNS } from '../../../shared/utils/validators.util';
import { RAJASTHAN_DISTRICTS } from './aspirant-form.types';

/**
 * Step 2: Permanent Address Form Fields
 */
export function getStep2PermanentAddressFields(): FormFieldConfig[] {
  const districtOptions: FormOption[] = RAJASTHAN_DISTRICTS.map(d => ({ label: d, value: d }));

  return [
    // Permanent Address Header
    {
      key: 'permHeading',
      label: 'PERMANENT ADDRESS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'permHouseNo',
      label: 'House No.',
      type: 'text',
      placeholder: 'e.g. 14-B',
      colSpan: 1
    },
    {
      key: 'permStreet',
      label: 'Street / Colony Name',
      type: 'text',
      placeholder: 'Street, Mohalla or Colony',
      colSpan: 2
    },
    {
      key: 'permWard',
      label: 'Ward No.',
      type: 'text',
      placeholder: 'Ward number',
      colSpan: 1
    },
    {
      key: 'permCity',
      label: 'Village / Town / City Name',
      type: 'text',
      required: true,
      requiredMessage: 'Village/Town/City is mandatory',
      placeholder: 'Village, Town or City',
      colSpan: 1
    },
    {
      key: 'permDistrict',
      label: 'District',
      type: 'select',
      required: true,
      colSpan: 1,
      options: districtOptions
    },
    {
      key: 'permBlock',
      label: 'Block Name',
      type: 'text',
      required: true,
      requiredMessage: 'Block name is mandatory',
      placeholder: 'Development Block',
      colSpan: 1
    },
    {
      key: 'permTehsil',
      label: 'Tehsil',
      type: 'text',
      required: true,
      requiredMessage: 'Tehsil is mandatory',
      placeholder: 'Revenue Tehsil',
      colSpan: 1
    },
    {
      key: 'permMunicipality',
      label: 'Municipality / Panchayat Samiti',
      type: 'text',
      required: true,
      placeholder: 'Panchayat Samiti / Municipality',
      colSpan: 1
    },
    {
      key: 'permPincode',
      label: 'Pincode',
      type: 'text',
      required: true,
      minLength: 6,
      maxLength: 6,
      pattern: REGEX_PATTERNS.PINCODE,
      patternMessage: 'Pincode must be a valid 6-digit code (not starting with 0)',
      placeholder: '6 digit Pincode',
      colSpan: 1
    },
    {
      key: 'permAssembly',
      label: 'Assembly Constituency',
      type: 'text',
      required: true,
      placeholder: 'Vidhan Sabha area',
      colSpan: 1
    },
    {
      key: 'permParliament',
      label: 'Parliament Constituency',
      type: 'text',
      required: true,
      placeholder: 'Lok Sabha constituency',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Communication Address Form Fields (without header so header + checkbox can be rendered in template)
 */
export function getStep2CommAddressFields(): FormFieldConfig[] {
  const districtOptions: FormOption[] = RAJASTHAN_DISTRICTS.map(d => ({ label: d, value: d }));

  return [
    {
      key: 'commHouseNo',
      label: 'House No.',
      type: 'text',
      placeholder: 'e.g. 14-B',
      colSpan: 1
    },
    {
      key: 'commStreet',
      label: 'Street Name',
      type: 'text',
      placeholder: 'Street, Mohalla or Colony',
      colSpan: 2
    },
    {
      key: 'commWard',
      label: 'Ward No.',
      type: 'text',
      placeholder: 'Ward number',
      colSpan: 1
    },
    {
      key: 'commCity',
      label: 'Village / Town / City Name',
      type: 'text',
      required: true,
      placeholder: 'Village, Town or City',
      colSpan: 1
    },
    {
      key: 'commDistrict',
      label: 'District',
      type: 'select',
      required: true,
      colSpan: 1,
      options: districtOptions
    },
    {
      key: 'commBlock',
      label: 'Block Name',
      type: 'text',
      required: true,
      placeholder: 'Development Block',
      colSpan: 1
    },
    {
      key: 'commTehsil',
      label: 'Tehsil',
      type: 'text',
      required: true,
      placeholder: 'Revenue Tehsil',
      colSpan: 1
    },
    {
      key: 'commMunicipality',
      label: 'Municipality / Panchayat Samiti',
      type: 'text',
      required: true,
      placeholder: 'Panchayat Samiti / Municipality',
      colSpan: 1
    },
    {
      key: 'commPincode',
      label: 'Pincode',
      type: 'text',
      required: true,
      minLength: 6,
      maxLength: 6,
      pattern: REGEX_PATTERNS.PINCODE,
      patternMessage: 'Pincode must be a valid 6-digit code (not starting with 0)',
      placeholder: '6 digit Pincode',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Contact Details Form Fields
 */
export function getStep2ContactFields(): FormFieldConfig[] {
  return [
    // Contact Details Header
    {
      key: 'contactHeading',
      label: 'CONTACT DETAILS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'mobileNo',
      label: 'Mobile Number',
      type: 'tel',
      required: true,
      requiredMessage: 'Mobile number is mandatory',
      prefixText: '+91',
      minLength: 10,
      maxLength: 10,
      pattern: REGEX_PATTERNS.MOBILE,
      patternMessage: 'Mobile must be 10 digits starting with 6, 7, 8 or 9',
      placeholder: '10 digit mobile number',
      colSpan: 1
    },
    {
      key: 'altMobileNo',
      label: 'Alternate Mobile Number',
      type: 'tel',
      prefixText: '+91',
      minLength: 10,
      maxLength: 10,
      pattern: REGEX_PATTERNS.MOBILE,
      patternMessage: 'Alternate mobile must be 10 digits starting with 6, 7, 8 or 9',
      placeholder: 'Secondary contact number',
      colSpan: 1
    },
    {
      key: 'landlineNo',
      label: 'Landline Number',
      type: 'tel',
      placeholder: 'STD Code - Landline No.',
      colSpan: 1
    },
    {
      key: 'email',
      label: 'Email Id (if any)',
      type: 'email',
      placeholder: 'aspirant@email.com',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Address Details & Contact Form Fields (Full combined list)
 */
export function getStep2AddressFields(): FormFieldConfig[] {
  return [
    ...getStep2PermanentAddressFields(),
    {
      key: 'commHeading',
      label: 'COMMUNICATION / CORRESPONDENCE ADDRESS',
      type: 'heading',
      colSpan: 'full'
    },
    ...getStep2CommAddressFields(),
    ...getStep2ContactFields()
  ];
}
