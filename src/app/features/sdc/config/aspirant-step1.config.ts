import { FormFieldConfig } from '../../../shared/components/form-sdc';
import { REGEX_PATTERNS } from '../../../shared/utils/validators.util';
import { calculateAgeFromDob } from './aspirant-form.types';

/**
 * Step 1: IDENTITY DETAILS  Form Fields
 */
export function getStep1PersonalFields(
  onDobChange?: (dob: string, model: any) => void,
  aadhaarTemplateRef?: any
): FormFieldConfig[] {
  return [
    // Identity Details Header
    {
      key: 'identityHeading',
      label: 'IDENTITY DETAILS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'aadhaarNo',
      label: 'Aadhaar No.',
      type: 'text',
      required: true,
      requiredMessage: 'Aadhaar number is mandatory',
      minLength: 12,
      maxLength: 12,
      pattern: '^[0-9]{12}$',
      patternMessage: 'Aadhaar must be exactly 12 digits (numbers only)',
      placeholder: '12 digit Aadhaar number',
    
      colSpan: 1
    },
    {
      key: 'confirmAadhaarNo',
      label: 'Confirm Aadhaar No.',
      type: 'text',
      required: true,
      requiredMessage: 'Please confirm the Aadhaar number',
      minLength: 12,
      maxLength: 12,
      pattern: '^[0-9]{12}$',
      patternMessage: 'Confirm Aadhaar must be exactly 12 digits',
      placeholder: 'Re-enter 12 digit Aadhaar number',
      validator: (value: string, model: any) => {
        if (!value) return null;
        if (value !== model?.aadhaarNo) {
          return 'Aadhaar numbers do not match';
        }
        return null;
      },
      colSpan: 1
    },
    {
      key: 'aadhaarDocProof',
      label: 'Aadhaar Card Document Proof',
      type: 'custom',
      colSpan: 2,
      template: aadhaarTemplateRef
    },
    {
      key: 'janaadhaarId',
      label: 'Janaadhaar ID',
      type: 'text',
      minLength: 10,
      maxLength: 10,
      pattern: '^[0-9]{10}$',
      patternMessage: 'Jan Aadhaar ID must be exactly 10 digits',
      placeholder: '10 digit Jan Aadhaar ID',
      hint: '',
      colSpan: 1
    },
    {
      key: 'otherIdType',
      label: 'Other IDs',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'None', value: 'None' },
        { label: 'PAN Card', value: 'PAN Card' },
        { label: 'Voter ID (EPIC)', value: 'Voter ID' },
        { label: 'Driving License', value: 'Driving License' },
        { label: 'Passport', value: 'Passport' },
        { label: 'Ration Card', value: 'Ration Card' }
      ]
    },
    {
      key: 'otherIdNo',
      label: (m: any) => {
        const type = m?.otherIdType;
        if (!type || type === 'None') return 'Other ID Nos.';
        if (type === 'PAN Card' || type.toLowerCase().includes('pan')) return 'PAN';
        if (type.toLowerCase().includes('voter')) return 'Voter ID (EPIC)';
        if (type.toLowerCase().includes('driving')) return 'Driving License No.';
        if (type.toLowerCase().includes('passport')) return 'Passport No.';
        if (type.toLowerCase().includes('ration')) return 'Ration Card No.';
        return `${type}`;
      },
      placeholder: (m: any) => {
        const type = m?.otherIdType;
        if (type === 'PAN Card' || type?.toLowerCase().includes('pan')) return 'e.g. ABCDE1234F  (10 chars)';
        if (type === 'Voter ID') return 'e.g. ABC1234567  (10 chars)';
        if (type === 'Driving License') return 'e.g. RJ01 20110012345  (up to 16 chars)';
        if (type === 'Passport') return 'e.g. A1234567  (8 chars)';
        if (type === 'Ration Card') return 'Enter Ration Card number';
        return 'Enter document number';
      },
      uppercase: true,
      validator: (value: string, model: any) => {
        if (!value) return null;
        const type = model?.otherIdType;
        if (!type || type === 'None') return null;
        const v = value.trim().toUpperCase();
        if (type === 'PAN Card') {
          if (!REGEX_PATTERNS.PAN.test(v))
            return 'PAN must be 10 chars: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)';
        } else if (type === 'Voter ID') {
          if (!REGEX_PATTERNS.VOTER_ID.test(v))
            return 'Voter ID (EPIC) must be 10 chars: 3 letters followed by 7 digits (e.g. ABC1234567)';
        } else if (type === 'Passport') {
          if (!REGEX_PATTERNS.PASSPORT.test(v))
            return 'Passport No. must be 8 chars: 1 letter followed by 7 digits (e.g. A1234567)';
        } else if (type === 'Driving License') {
          if (!REGEX_PATTERNS.DRIVING_LICENSE.test(v) || v.length < 10 || v.length > 16)
            return 'Driving License must be 10–16 alphanumeric characters (e.g. RJ0120110012345)';
        }
        return null;
      },
      type: 'text',
      colSpan: 2,
      visible: (m) => m.otherIdType && m.otherIdType !== 'None'
    },

    // Aspirant Details Header
  
    {
      key: 'aspirantName',
      label: 'Name of Aspirant',
      type: 'text',
      required: true,
      requiredMessage: 'Aspirant name is mandatory',
      placeholder: 'Candidate full name as per Aadhaar',
      colSpan: 2
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      requiredMessage: 'Gender is mandatory',
      colSpan: 1,
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Transgender', value: 'Transgender' }
      ]
    },
    {
      key: 'relationType',
      label: 'Select Relation',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Father', value: 'Father' },
        { label: 'Husband', value: 'Husband' },
        { label: 'Guardian', value: 'Guardian' }
      ]
    },
    {
      key: 'relationName',
      label: (model: any) => {
        const rel = (model?.relationType || '').trim();
        if (rel === 'Father') return "Father's Name";
        if (rel === 'Husband') return "Husband's Name";
        if (rel === 'Mother') return "Mother's Name";
        if (rel === 'Guardian') return "Guardian's Name";
        return "Father's / Husband's / Guardian Name";
      },
      placeholder: (model: any) => {
        const rel = (model?.relationType || '').trim();
        if (rel === 'Father') return "Father's full name";
        if (rel === 'Husband') return "Husband's full name";
        if (rel === 'Mother') return "Mother's full name";
        if (rel === 'Guardian') return "Guardian's full name";
        return "Relative full name";
      },
      type: 'text',
      required: true,
      requiredMessage: 'Relative name is mandatory',
      colSpan: 2
    },
    {
      key: 'motherName',
      label: "Mother's Name",
      type: 'text',
      placeholder: 'Mother full name',
      colSpan: 2
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      requiredMessage: 'Date of birth is mandatory',
      colSpan: 1,
      onChange: (val, field, model) => {
        model.age = calculateAgeFromDob(val);
        if (onDobChange) onDobChange(val, model);
      }
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      readonly: true,
      suffixText: 'Yrs',
      colSpan: 1
    },
    {
      key: 'educationalQualification',
      label: 'Educational Qualification',
      type: 'select',
      required: true,
      requiredMessage: 'Educational qualification is mandatory',
      colSpan: 2,
      options: [
        { label: 'Below 8th Standard', value: 'Below 8th' },
        { label: '8th Standard Pass', value: '8th Pass' },
        { label: '10th Standard Pass (Matriculation)', value: '10th Pass' },
        { label: '12th Standard Pass (Senior Secondary)', value: '12th Pass' },
        { label: 'ITI Certificate Holder', value: 'ITI' },
        { label: 'Polytechnic Diploma', value: 'Diploma' },
        { label: 'Graduate (B.A / B.Sc / B.Com / B.Tech)', value: 'Graduate' },
        { label: 'Post Graduate (M.A / M.Sc / M.Tech)', value: 'Post Graduate' }
      ]
    },
    {
      key: 'religion',
      label: 'Religion',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Hindu', value: 'Hindu' },
        { label: 'Muslim', value: 'Muslim' },
        { label: 'Sikh', value: 'Sikh' },
        { label: 'Christian', value: 'Christian' },
        { label: 'Jain', value: 'Jain' },
        { label: 'Buddhist', value: 'Buddhist' },
        { label: 'Other', value: 'Other' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'General', value: 'General' },
        { label: 'OBC (Other Backward Class)', value: 'OBC' },
        { label: 'SC (Scheduled Caste)', value: 'SC' },
        { label: 'ST (Scheduled Tribe)', value: 'ST' },
        { label: 'EWS (Economically Weaker Section)', value: 'EWS' },
        { label: 'MBC (Most Backward Class)', value: 'MBC' }
      ]
    },
    {
      key: 'minority',
      label: 'Minority',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'specialAbility',
      label: 'Person with Special Ability (PwD)',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'disabilityType',
      label: 'Disability Type',
      type: 'select',
      colSpan: 1,
      visible: (m) => m.specialAbility === 'Yes',
      options: [
        { label: 'Locomotor Disability', value: 'Locomotor' },
        { label: 'Visual Impairment', value: 'Visual' },
        { label: 'Hearing Impairment', value: 'Hearing' },
        { label: 'Intellectual Disability', value: 'Intellectual' },
        { label: 'Multiple Disabilities', value: 'Multiple' }
      ]
    },
    {
      key: 'areaType',
      label: 'Rural / Urban',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Rural', value: 'Rural' },
        { label: 'Urban', value: 'Urban' }
      ]
    }
  ];
}
