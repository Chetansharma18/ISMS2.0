import { FormFieldConfig } from '../../../shared/components/form-sdc';
import { REGEX_PATTERNS } from '../../../shared/utils/validators.util';

/**
 * Step 3: Bank, Family / Economic & Worker Details Form Fields
 */
export function getStep3EconomicWorkerFields(): FormFieldConfig[] {
  return [
    // Bank Details Header
    {
      key: 'bankHeading',
      label: 'Bank Details',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'bankAccountNo',
      label: 'Account No',
      type: 'text',
      minLength: 9,
      maxLength: 18,
      pattern: REGEX_PATTERNS.BANK_ACCOUNT,
      patternMessage: 'Bank account number must be 9–18 digits (numbers only)',
      placeholder: 'Bank savings account number',
      colSpan: 1
    },
    {
      key: 'bankAccountName',
      label: 'Account Name',
      type: 'text',
      placeholder: 'Full name as per passbook',
      colSpan: 1
    },
    {
      key: 'bankAccountType',
      label: 'Account Type',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'Savings Account', value: 'Savings' },
        { label: 'Current Account', value: 'Current' },
        { label: 'Jan Dhan Account (PMJDY)', value: 'Jan Dhan' }
      ]
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'State Bank of India (SBI)', value: 'State Bank of India' },
        { label: 'Punjab National Bank (PNB)', value: 'Punjab National Bank' },
        { label: 'Bank of Baroda', value: 'Bank of Baroda' },
        { label: 'Canara Bank', value: 'Canara Bank' },
        { label: 'Union Bank of India', value: 'Union Bank of India' },
        { label: 'HDFC Bank', value: 'HDFC Bank' },
        { label: 'ICICI Bank', value: 'ICICI Bank' },
        { label: 'Rajasthan Marudhara Gramin Bank', value: 'Rajasthan Marudhara Gramin Bank' },
        { label: 'Baroda Rajasthan Kshetriya Gramin Bank', value: 'BRKGB' },
        { label: 'Other Scheduled Commercial Bank', value: 'Other' }
      ]
    },
    {
      key: 'bankBranch',
      label: 'Bank Branch',
      type: 'text',
      placeholder: 'Branch location',
      colSpan: 1
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      uppercase: true,
      minLength: 11,
      maxLength: 11,
      pattern: REGEX_PATTERNS.IFSC,
      patternMessage: 'IFSC must be 11 chars: 4 letters, 0, then 6 alphanumerics (e.g. SBIN0001234)',
      placeholder: 'e.g. SBIN0001234',
      
      colSpan: 1
    },
    {
      key: 'micrCode',
      label: 'MICR Code',
      type: 'text',
      minLength: 9,
      maxLength: 9,
      pattern: '^[0-9]{9}$',
      patternMessage: 'MICR Code must be exactly 9 digits',
      placeholder: '9 digit MICR',
     
      colSpan: 1
    },

    // Family / Economic Details Header
   
    {
      key: 'annualFamilyIncome',
      label: 'Annual Family Income',
      type: 'number',
      required: true,
      prefixText: '₹',
      placeholder: 'e.g. 120000',
      colSpan: 1
    },
    {
      key: 'incomeSlab',
      label: 'Income Slab (Annual Slab)',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Below ₹50,000', value: 'Below 50K' },
        { label: '₹50,001 - ₹1,00,000', value: '50K-1L' },
        { label: '₹1,00,001 - ₹2,50,000', value: '1L-2.5L' },
        { label: '₹2,50,001 - ₹5,00,000', value: '2.5L-5L' },
        { label: 'Above ₹5,00,000', value: 'Above 5L' }
      ]
    },
    {
      key: 'economicStatus',
      label: 'Economic Status',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'APL (Above Poverty Line)', value: 'APL' },
        { label: 'BPL (Below Poverty Line)', value: 'BPL' },
        { label: 'State BPL', value: 'State BPL' },
        { label: 'Antyodaya Anna Yojana (AAY)', value: 'Antyodaya' },
        { label: 'General / Non-BPL', value: 'General' }
      ]
    },
    {
      key: 'economicCardNo',
      label: 'Economic Status Card No.',
      type: 'text',
      placeholder: 'Ration / BPL card number',
      colSpan: 1
    },

    // Government / Worker Details Header
    {
      key: 'workerHeading',
      label: 'Government & Employment Details',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'bocwWorker',
      label: 'BoCW Worker',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'bocwNo',
      label: 'BoCW No.',
      type: 'text',
      placeholder: 'BoCW registration number',
      colSpan: 1,
      visible: (m) => m.bocwWorker === 'Yes'
    },
    {
      key: 'mgnregaWorker',
      label: 'MGNREGA Worker',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'mgnregaNo',
      label: 'MGNREGA No.',
      type: 'text',
      placeholder: 'Job card registration number',
      colSpan: 1,
      visible: (m) => m.mgnregaWorker === 'Yes'
    },
    {
      key: 'isRsby',
      label: 'Is RSBY?',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'rsbyNo',
      label: 'RSBY No.',
      type: 'text',
      placeholder: 'RSBY smart card number',
      colSpan: 1,
      visible: (m) => m.isRsby === 'Yes'
    },
    {
      key: 'gramsabhaPip',
      label: 'Gramsabha/PIP',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'nrlmMember',
      label: 'NRLM SHG Member',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'nrlmNo',
      label: 'NRLM No. of SHG Member',
      type: 'text',
      placeholder: 'Self Help Group membership ID',
      colSpan: 1,
      visible: (m) => m.nrlmMember === 'Yes'
    },

    // Electoral Details Header
    {
      key: 'electoralHeading',
      label: 'ELECTORAL DETAILS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'epicNo',
      label: 'EPIC No. (Voter ID)',
      type: 'text',
      uppercase: true,
      minLength: 10,
      maxLength: 10,
      pattern: REGEX_PATTERNS.VOTER_ID,
      patternMessage: 'EPIC / Voter ID must be 10 chars: 3 letters followed by 7 digits (e.g. RJA0001234)',
      placeholder: 'e.g. RJA0001234  (10 chars)',
      colSpan: 2
    }
  ];
}
