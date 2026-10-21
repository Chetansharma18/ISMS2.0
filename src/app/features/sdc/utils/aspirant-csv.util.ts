import type { AspirantRecord } from '../models/aspirant.model';

const HEADERS = [
  'Aspirant ID',
  'Candidate Name',
  'Gender',
  'Date of Birth',
  'Age',
  'Aadhaar No (Masked)',
  'Jan Aadhaar ID',
  'Other ID Type',
  'Other ID Number',
  'Father / Husband Name',
  'Relationship',
  'Mother Name',
  'Educational Qualification',
  'Category',
  'Religion',
  'Minority',
  'Special Ability (PwD)',
  'Disability Type',
  'Area Type',
  'Interested Out of Rajasthan',
  'Mobile Number',
  'Alt Mobile Number',
  'Email Address',
  'Permanent Address',
  'Permanent District',
  'Permanent Pincode',
  'Communication Address',
  'SDC Code',
  'SDC Center Name',
  'SDC District',
  'Batch Code',
  'Batch Name',
  'Course Name',
  'Sector',
  'Government Scheme',
  'Enrollment Date',
  'Training Status',
  'Biometric Verified',
  'Attendance Percentage',
  'Bank Name',
  'Account Number',
  'Account Holder Name',
  'Account Type',
  'Bank Branch',
  'IFSC Code',
  'MICR Code',
  'Annual Family Income (INR)',
  'Income Slab',
  'Economic Status',
  'Economic Card / Ration No',
  'BoCW Worker',
  'BoCW Registration No',
  'MGNREGA Worker',
  'MGNREGA Job Card No',
  'RSBY Beneficiary',
  'Gram Sabha PIP Listed',
  'NRLM SHG Member',
  'Voter ID (EPIC)',
  'Preferred Sectors',
  'Attached Documents Count'
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  return `"${String(value).trim().replace(/"/g, '""')}"`;
}

function csvRow(a: AspirantRecord): string[] {
  const permAddress = [a.permHouseNo, a.permStreet, a.permWard, a.permCity, a.permBlock, a.permDistrict, a.permPincode]
    .filter(Boolean)
    .join(', ');
  const commAddress = a.isAddressSame
    ? permAddress || 'Same as Permanent Address'
    : [a.commHouseNo, a.commStreet, a.commWard, a.commCity, a.commBlock, a.commDistrict, a.commPincode].filter(Boolean).join(', ');
  const docCount = Array.isArray(a.documents) ? a.documents.filter(d => d.status === 'UPLOADED').length : 0;

  return [
    a.id || '',
    a.aspirantName || '',
    a.gender || '',
    a.dob || '',
    a.age != null ? String(a.age) : '',
    a.aadhaarMasked || (a.aadhaarNo ? `XXXX-XXXX-${a.aadhaarNo.slice(-4)}` : ''),
    a.janaadhaarId || '',
    a.otherIdType || '',
    a.otherIdNo || '',
    a.relationName || '',
    a.relationType || '',
    a.motherName || '',
    a.educationalQualification || '',
    a.category || '',
    a.religion || '',
    a.minority || '',
    a.specialAbility || 'No',
    a.disabilityType || '',
    a.areaType || '',
    a.interestedOutOfRajasthan || 'No',
    a.mobileNo || '',
    a.altMobileNo || '',
    a.email || '',
    permAddress,
    a.permDistrict || '',
    a.permPincode || '',
    commAddress,
    a.sdcCode || '',
    a.sdcName || '',
    a.sdcDistrict || '',
    a.batchCode || '',
    a.batchName || '',
    a.courseName || '',
    a.sector || '',
    a.scheme || '',
    a.enrollmentDate || '',
    a.trainingStatus || '',
    a.biometricVerified ? 'Yes' : 'No',
    a.attendancePercent != null ? `${a.attendancePercent}%` : '0%',
    a.bankName || '',
    a.bankAccountNo || '',
    a.bankAccountName || '',
    a.bankAccountType || '',
    a.bankBranch || '',
    a.ifscCode || '',
    a.micrCode || '',
    a.annualFamilyIncome != null ? String(a.annualFamilyIncome) : '',
    a.incomeSlab || '',
    a.economicStatus || '',
    a.economicCardNo || '',
    a.bocwWorker || 'No',
    a.bocwNo || '',
    a.mgnregaWorker || 'No',
    a.mgnregaNo || '',
    a.isRsby || 'No',
    a.gramsabhaPip || 'No',
    a.nrlmMember || 'No',
    a.epicNo || '',
    Array.isArray(a.preferredSectors) ? a.preferredSectors.join('; ') : '',
    String(docCount)
  ];
}

/** The roster as CSV text (with a byte-order mark so Excel opens it with the right encoding). */
export function aspirantsToCsv(aspirants: readonly AspirantRecord[]): string {
  return (
    '\uFEFF' +
    [HEADERS.map(escapeCsv).join(','), ...aspirants.map(a => csvRow(a).map(escapeCsv).join(','))].join('\r\n')
  );
}

/** Downloads the roster as a CSV file. */
export function downloadAspirantsCsv(aspirants: readonly AspirantRecord[]): void {
  const blob = new Blob([aspirantsToCsv(aspirants)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Aspirants_Roster_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
