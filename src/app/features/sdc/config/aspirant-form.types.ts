export const RAJASTHAN_DISTRICTS: string[] = [
  'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer', 'Beawar',
  'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa',
  'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu', 'Dungarpur', 'Gangapur City',
  'Hanumangarh', 'Jaipur', 'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar',
  'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural', 'Karauli', 'Kekri', 'Khairthal-Tijara',
  'Kota', 'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 'Pali', 'Phalodi',
  'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura',
  'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
];

export interface AspirantDocumentItem {
  id: string;
  itemNumber?: number;
  docType: string;
  docName: string;
  badgeLabel?: string;
  badgeType?: 'mandatory' | 'conditional' | 'optional';
  description?: string;
  conditionNote?: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  status: 'PENDING' | 'UPLOADED';
}

export interface AspirantFormData {
  registrationNo?: string;
  aspirantRegNo?: string;

  // Step 1: Main / Personal Details
  aadhaarNo: string;
  confirmAadhaarNo?: string;
  janaadhaarId: string;
  otherIdType?: string;
  otherIdNo?: string;
  aadhaarDocUrl?: string;
  aadhaarDocName?: string;
  aadhaarDocSize?: string;

  aspirantName: string;
  gender: string;
  relationType: string;
  relation?: string;
  relationName?: string;
  motherName: string;
  dob: string;
  age: number | string;
  educationalQualification: string;
  religion: string;
  category: string;
  minority?: string;
  specialAbility: string;
  disabilityType?: string;
  areaType?: string;
  interestedOutOfRajasthan?: string;
  interestedSector?: string;

  // Step 2: Training and Employment Details
  trainingPreferredDistrict?: string;
  employmentType?: string;

  // Step 3: Address Details
  address?: string;
  homeDistrict?: string;
  ruralUrban?: string;
  pincode?: string;

  permHouseNo?: string;
  permStreet?: string;
  permWard?: string;
  permCity?: string;
  permDistrict?: string;
  permBlock?: string;
  permTehsil?: string;
  permMunicipality?: string;
  permPincode?: string;
  permAssembly?: string;
  permParliament?: string;

  isAddressSame?: boolean;

  commHouseNo?: string;
  commStreet?: string;
  commWard?: string;
  commCity?: string;
  commDistrict?: string;
  commBlock?: string;
  commTehsil?: string;
  commMunicipality?: string;
  commPincode?: string;

  // Step 4: Contact Details
  mobileNo: string;
  altMobileNo?: string;
  landlineNo?: string;
  email?: string;

  // Step 5: Upload and Consent / Additional Fields
  candidatePhoto?: any;
  candidatePhotoUrl?: string;
  candidatePhotoName?: string;
  termsAccepted?: boolean;

  // Optional legacy Bank & Worker Details
  bankAccountNo?: string;
  bankAccountName?: string;
  bankAccountType?: string;
  bankName?: string;
  bankBranch?: string;
  ifscCode?: string;
  micrCode?: string;

  annualFamilyIncome?: number | string;
  incomeSlab?: string;
  economicStatus?: string;
  economicCardNo?: string;

  bocwWorker?: string;
  bocwNo?: string;
  mgnregaWorker?: string;
  mgnregaNo?: string;
  isRsby?: string;
  rsbyNo?: string;
  gramsabhaPip?: string;
  nrlmMember?: string;
  nrlmNo?: string;

  epicNo?: string;

  preferredSectors: string[];
  documents: AspirantDocumentItem[];
}

export function calculateAgeFromDob(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}
