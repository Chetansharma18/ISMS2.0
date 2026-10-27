import { AspirantFormData, getDefaultAspirantDocuments } from '../../config/aspirant-form.config';

/** Blank model for a new aspirant registration; every field starts empty or at its form default. */
export function createEmptyAspirantFormData(): AspirantFormData {
  return {
    registrationNo: 'ASP/2026/08421',
    aspirantRegNo: 'ASP/2026/08421',
    // Step 1: Identity & Personal Details — starts empty
    aadhaarNo: '',
    confirmAadhaarNo: '',
    janaadhaarId: '',
    otherIdType: 'Aadhaar Card',
    otherIdNo: '',
    idType: 'Aadhaar Card',
    idNumber: '',
    aadhaarDocName: '',
    aadhaarDocSize: '',
    aadhaarDocUrl: '',

    aspirantName: '',
    gender: '',
    relationType: '',
    relation: '',
    relationName: '',
    motherName: '',
    dob: '',
    age: '',
    educationalQualification: '',
    religion: '',
    category: '',
    minority: 'No',
    specialAbility: 'No',
    disabilityType: '',
    areaType: '',
    interestedSector: '',

    // Step 2: Training and Employment Details
    trainingPreferredDistrict: '',
    employmentType: '',

    // Step 3: Address Details
    address: '',
    homeDistrict: '',
    ruralUrban: 'Rural',
    pincode: '',

    permHouseNo: '',
    permStreet: '',
    permWard: '',
    permCity: '',
    permDistrict: '',
    permBlock: '',
    permTehsil: '',
    permMunicipality: '',
    permPincode: '',
    permAssembly: '',
    permParliament: '',

    isAddressSame: false,

    commHouseNo: '',
    commStreet: '',
    commWard: '',
    commCity: '',
    commDistrict: '',
    commBlock: '',
    commTehsil: '',
    commMunicipality: '',
    commPincode: '',

    // Step 4: Contact Details
    mobileNo: '',
    altMobileNo: '',
    landlineNo: '',
    email: '',

    // Step 5: Upload and Consent
    candidatePhoto: null,
    termsAccepted: false,

    // Step 3: Bank & Worker Details — starts empty
    bankAccountNo: '',
    bankAccountName: '',
    bankAccountType: 'Savings',
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    micrCode: '',

    annualFamilyIncome: '',
    incomeSlab: '',
    economicStatus: '',
    economicCardNo: '',

    bocwWorker: 'No',
    bocwNo: '',
    mgnregaWorker: 'No',
    mgnregaNo: '',
    isRsby: 'No',
    rsbyNo: '',
    gramsabhaPip: 'No',
    nrlmMember: 'No',
    nrlmNo: '',

    epicNo: '',

    // Step 4: Sector Preference, Photo & Documents — starts empty
    preferredSectors: [],
    candidatePhotoUrl: '',
    candidatePhotoName: '',
    documents: getDefaultAspirantDocuments()
  };
}
