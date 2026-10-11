import { AspirantFormData, getDefaultAspirantDocuments } from '../../config/aspirant-form.config';

/** Blank model for a new aspirant registration; every field starts empty or at its form default. */
export function createEmptyAspirantFormData(): AspirantFormData {
  return {
    // Step 1: Identity & Personal Details — starts empty
    aadhaarNo: '',
    confirmAadhaarNo: '',
    janaadhaarId: '',
    otherIdType: 'None',
    otherIdNo: '',
    aadhaarDocName: '',
    aadhaarDocSize: '',
    aadhaarDocUrl: '',

    aspirantName: '',
    gender: '',
    relationType: '',
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

    // Step 2: Address Details — starts empty
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

    mobileNo: '',
    altMobileNo: '',
    landlineNo: '',
    email: '',

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
