import { AspirantRecord } from '../../../features/sdc/models/aspirant.model';
import { resolveMock } from '../mock.config';
export interface MockAspirantItem {
  id: string;
  regId: string;
  name: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobile: string;
  aadhaarLast4: string;
  district: string;
  batchId: string;
  batchCode: string;
  course: string;
  biometricEnrolled: boolean;
  attendancePercent: number;
  assessmentStatus: 'Pending' | 'Passed' | 'Failed';
  placementStatus: 'Placed' | 'Self-Employed' | 'Seeking Placement';
}

export const MOCK_ASPIRANTS: MockAspirantItem[] = resolveMock([
  {
    id: 'asp-1',
    regId: 'ASP-2026-1001',
    name: 'Rahul Gurjar',
    fatherName: 'Ramprasad Gurjar',
    gender: 'Male',
    dob: '2002-05-14',
    mobile: '9828100001',
    aadhaarLast4: '4512',
    district: 'Jaipur',
    batchId: 'batch-1',
    batchCode: 'BAT-2026-001',
    course: 'Solar Panel Installation Technician',
    biometricEnrolled: true,
    attendancePercent: 94,
    assessmentStatus: 'Pending',
    placementStatus: 'Seeking Placement'
  },
  {
    id: 'asp-2',
    regId: 'ASP-2026-1002',
    name: 'Pooja Kanwar',
    fatherName: 'Bhanwar Singh',
    gender: 'Female',
    dob: '2003-08-22',
    mobile: '9828100002',
    aadhaarLast4: '7821',
    district: 'Jaipur',
    batchId: 'batch-2',
    batchCode: 'BAT-2026-002',
    course: 'Domestic Data Entry Operator',
    biometricEnrolled: true,
    attendancePercent: 90,
    assessmentStatus: 'Pending',
    placementStatus: 'Seeking Placement'
  },
  {
    id: 'asp-3',
    regId: 'ASP-2026-1003',
    name: 'Kavita Bheel',
    fatherName: 'Shanker Bheel',
    gender: 'Female',
    dob: '2001-11-05',
    mobile: '9828100003',
    aadhaarLast4: '9902',
    district: 'Jodhpur',
    batchId: 'batch-3',
    batchCode: 'BAT-2026-003',
    course: 'Self Employed Tailor',
    biometricEnrolled: true,
    attendancePercent: 96,
    assessmentStatus: 'Pending',
    placementStatus: 'Self-Employed'
  },
  {
    id: 'asp-4',
    regId: 'ASP-2026-1004',
    name: 'Vikas Meena',
    fatherName: 'Kirodi Lal Meena',
    gender: 'Male',
    dob: '2000-03-18',
    mobile: '9828100004',
    aadhaarLast4: '3341',
    district: 'Udaipur',
    batchId: 'batch-4',
    batchCode: 'BAT-2026-004',
    course: 'General Duty Assistant',
    biometricEnrolled: true,
    attendancePercent: 92,
    assessmentStatus: 'Passed',
    placementStatus: 'Placed'
  }
]);


export const INITIAL_ASPIRANTS: AspirantRecord[] = resolveMock([
    {
      id: 'ASP-RJ-2026-98412',
      aadhaarNo: '789456123012',
      confirmAadhaarNo: '789456123012',
      aadhaarMasked: 'XXXX-XXXX-3012',
      janaadhaarId: '2026894123',
      otherIdType: 'PAN Card',
      otherIdNo: 'ABCDE1234F',
      aadhaarDocName: 'Aadhaar_Rahul_Sharma.pdf',
      aadhaarDocSize: '1.4 MB',
      aadhaarDocUrl: '',

      aspirantName: 'Rahul Sharma',
      gender: 'Male',
      relationType: 'Father',
      relationName: 'Manoj Sharma',
      motherName: 'Sunita Sharma',
      dob: '2002-05-15',
      age: 24,
      educationalQualification: '12th Pass',
      religion: 'Hindu',
      category: 'OBC',
      minority: 'No',
      specialAbility: 'No',
      disabilityType: '',
      areaType: 'Rural',
      interestedOutOfRajasthan: 'Yes',

      permHouseNo: '45-B',
      permStreet: 'Kisan Colony, Sanganer',
      permWard: 'Ward 12',
      permCity: 'Jaipur',
      permDistrict: 'Jaipur',
      permBlock: 'Sanganer',
      permTehsil: 'Sanganer',
      permMunicipality: 'Sanganer Panchayat Samiti',
      permPincode: '302029',
      permAssembly: 'Sanganer',
      permParliament: 'Jaipur Rural',

      isAddressSame: true,
      commHouseNo: '45-B',
      commStreet: 'Kisan Colony, Sanganer',
      commWard: 'Ward 12',
      commCity: 'Jaipur',
      commDistrict: 'Jaipur',
      commBlock: 'Sanganer',
      commTehsil: 'Sanganer',
      commMunicipality: 'Sanganer Panchayat Samiti',
      commPincode: '302029',

      mobileNo: '9876543210',
      altMobileNo: '9829012345',
      landlineNo: '',
      email: 'rahul.sharma@example.com',

      bankAccountNo: '312456789012',
      bankAccountName: 'Rahul Sharma',
      bankAccountType: 'Savings',
      bankName: 'State Bank of India',
      bankBranch: 'Sanganer Branch, Jaipur',
      ifscCode: 'SBIN0001234',
      micrCode: '302002015',

      annualFamilyIncome: 120000,
      incomeSlab: '1L-2.5L',
      economicStatus: 'APL',
      economicCardNo: 'RAT-JP-2026-9812',

      bocwWorker: 'No',
      bocwNo: '',
      mgnregaWorker: 'No',
      mgnregaNo: '',
      isRsby: 'No',
      rsbyNo: '',
      gramsabhaPip: 'No',
      nrlmMember: 'No',
      nrlmNo: '',

      epicNo: 'RJ/01/042/981234',

      preferredSectors: ['Green Energy', 'Electronics'],
      candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E',
      candidatePhotoName: 'Rahul_Sharma_Photo.jpg',
      documents: [
        { id: 'd1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: 'Aadhaar_Rahul.pdf', fileSize: '1.4 MB', status: 'UPLOADED' },
        { id: 'd2', docType: 'Educational Certificate', docName: 'Class 12 Marksheet', fileName: 'Class_12.pdf', fileSize: '2.1 MB', status: 'UPLOADED' },
        { id: 'd3', docType: 'Domicile Certificate', docName: 'Rajasthan Mool Niwas', fileName: 'Bonafide.pdf', fileSize: '950 KB', status: 'UPLOADED' }
      ],

      // SDC Center Info
      sdcId: 'sdc-101',
      sdcCode: 'SDC-0001',
      sdcName: 'Jaipur Skill Center',
      sdcDistrict: 'Jaipur',

      // Batch Info
      batchId: 'batch-201',
      batchCode: 'B-26-0001',
      batchName: 'Solar Tech Batch 01',
      courseName: 'Domestic Data Entry Operator',
      scheme: 'SAMARTH',
      sector: 'Aerospace and Aviation',

      // Status
      enrollmentDate: '2026-09-02',
      trainingStatus: 'IN_TRAINING',
      biometricVerified: true,
      attendancePercent: 96
    },
    {
      id: 'ASP-RJ-2026-98413',
      aadhaarNo: '654789123456',
      confirmAadhaarNo: '654789123456',
      aadhaarMasked: 'XXXX-XXXX-3456',
      janaadhaarId: '2026771120',
      otherIdType: 'Voter ID',
      otherIdNo: 'RJ029381',
      aadhaarDocName: 'Aadhaar_Sunil_Kumar.pdf',
      aadhaarDocSize: '1.2 MB',
      aadhaarDocUrl: '',

      aspirantName: 'Sunil Kumar Sharma',
      gender: 'Male',
      relationType: 'Father',
      relationName: 'Ramprasad Sharma',
      motherName: 'Kamla Devi',
      dob: '2001-08-20',
      age: 25,
      educationalQualification: 'Graduate',
      religion: 'Hindu',
      category: 'General',
      minority: 'No',
      specialAbility: 'No',
      disabilityType: '',
      areaType: 'Urban',
      interestedOutOfRajasthan: 'No',

      permHouseNo: '12/88',
      permStreet: 'Malviya Nagar, Sector 4',
      permWard: 'Ward 25',
      permCity: 'Jaipur',
      permDistrict: 'Jaipur',
      permBlock: 'Jaipur',
      permTehsil: 'Jaipur',
      permMunicipality: 'Jaipur Nagar Nigam',
      permPincode: '302017',
      permAssembly: 'Malviya Nagar',
      permParliament: 'Jaipur',

      isAddressSame: true,
      commHouseNo: '12/88',
      commStreet: 'Malviya Nagar, Sector 4',
      commWard: 'Ward 25',
      commCity: 'Jaipur',
      commDistrict: 'Jaipur',
      commBlock: 'Jaipur',
      commTehsil: 'Jaipur',
      commMunicipality: 'Jaipur Nagar Nigam',
      commPincode: '302017',

      mobileNo: '9829188412',
      altMobileNo: '',
      landlineNo: '',
      email: 'sunil.sharma@example.com',

      bankAccountNo: '5010045612348',
      bankAccountName: 'Sunil Kumar Sharma',
      bankAccountType: 'Savings',
      bankName: 'HDFC Bank',
      bankBranch: 'Malviya Nagar, Jaipur',
      ifscCode: 'HDFC0001234',
      micrCode: '302240004',

      annualFamilyIncome: 180000,
      incomeSlab: '1L-2.5L',
      economicStatus: 'APL',
      economicCardNo: 'RAT-JP-2026-4411',

      bocwWorker: 'No',
      bocwNo: '',
      mgnregaWorker: 'No',
      mgnregaNo: '',
      isRsby: 'No',
      rsbyNo: '',
      gramsabhaPip: 'No',
      nrlmMember: 'No',
      nrlmNo: '',

      epicNo: 'RJ/01/033/881234',

      preferredSectors: ['Green Energy', 'Automotive'],
      candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E',
      candidatePhotoName: 'Sunil_Kumar_Photo.jpg',
      documents: [
        { id: 'd1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Proof', fileName: 'Aadhaar_Sunil.pdf', fileSize: '1.2 MB', status: 'UPLOADED' },
        { id: 'd2', docType: 'Educational Certificate', docName: 'B.Sc Degree Certificate', fileName: 'Degree.pdf', fileSize: '1.8 MB', status: 'UPLOADED' }
      ],

      // SDC Center Info
      sdcId: 'sdc-101',
      sdcCode: 'SDC-0001',
      sdcName: 'Jaipur Skill Center',
      sdcDistrict: 'Jaipur',

      // Batch Info
      batchId: 'batch-201',
      batchCode: 'B-26-0001',
      batchName: 'Solar Tech Batch 01',
      courseName: 'Domestic Data Entry Operator',
      scheme: 'SAMARTH',
      sector: 'Aerospace and Aviation',

      // Status
      enrollmentDate: '2026-09-01',
      trainingStatus: 'IN_TRAINING',
      biometricVerified: true,
      attendancePercent: 94
    },
    {
      id: 'ASP-RJ-2026-98414',
      aadhaarNo: '984512365478',
      confirmAadhaarNo: '984512365478',
      aadhaarMasked: 'XXXX-XXXX-5478',
      janaadhaarId: '2026993344',
      otherIdType: 'PAN Card',
      otherIdNo: 'PRYMN5544K',
      aadhaarDocName: 'Aadhaar_Priya_Meena.pdf',
      aadhaarDocSize: '1.6 MB',
      aadhaarDocUrl: '',

      aspirantName: 'Priya Meena',
      gender: 'Female',
      relationType: 'Father',
      relationName: 'Kailash Meena',
      motherName: 'Geeta Devi',
      dob: '2003-11-10',
      age: 23,
      educationalQualification: '12th Pass',
      religion: 'Hindu',
      category: 'ST',
      minority: 'No',
      specialAbility: 'No',
      disabilityType: '',
      areaType: 'Rural',
      interestedOutOfRajasthan: 'No',

      permHouseNo: '72',
      permStreet: 'Gram Panchayat Bassi',
      permWard: 'Ward 04',
      permCity: 'Bassi',
      permDistrict: 'Jaipur',
      permBlock: 'Bassi',
      permTehsil: 'Bassi',
      permMunicipality: 'Bassi Panchayat Samiti',
      permPincode: '303301',
      permAssembly: 'Bassi',
      permParliament: 'Dausa',

      isAddressSame: true,
      commHouseNo: '72',
      commStreet: 'Gram Panchayat Bassi',
      commWard: 'Ward 04',
      commCity: 'Bassi',
      commDistrict: 'Jaipur',
      commBlock: 'Bassi',
      commTehsil: 'Bassi',
      commMunicipality: 'Bassi Panchayat Samiti',
      commPincode: '303301',

      mobileNo: '9414233889',
      altMobileNo: '9414233880',
      landlineNo: '',
      email: 'priya.meena@example.com',

      bankAccountNo: '621458900124',
      bankAccountName: 'Priya Meena',
      bankAccountType: 'Savings',
      bankName: 'Bank of Baroda',
      bankBranch: 'Bassi Branch',
      ifscCode: 'BARB0BASSIX',
      micrCode: '302012055',

      annualFamilyIncome: 90000,
      incomeSlab: 'Below 1L',
      economicStatus: 'BPL',
      economicCardNo: 'RAT-BPL-2026-902',

      bocwWorker: 'Yes',
      bocwNo: 'BOCW/JP/2025/1129',
      mgnregaWorker: 'Yes',
      mgnregaNo: 'MGNREGA/RJ/04/9912',
      isRsby: 'No',
      rsbyNo: '',
      gramsabhaPip: 'Yes',
      nrlmMember: 'No',
      nrlmNo: '',

      epicNo: 'RJ/01/049/223411',

      preferredSectors: ['IT & ITeS', 'Electronics'],
      candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E',
      candidatePhotoName: 'Priya_Meena_Passport.jpg',
      documents: [
        { id: 'd1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: 'Aadhaar_Priya.pdf', fileSize: '1.6 MB', status: 'UPLOADED' },
        { id: 'd2', docType: 'Caste Certificate', docName: 'ST Certificate Rajasthan', fileName: 'Caste_Certificate.pdf', fileSize: '850 KB', status: 'UPLOADED' }
      ],

      // SDC Center Info
      sdcId: 'sdc-101',
      sdcCode: 'SDC-0001',
      sdcName: 'Jaipur Skill Center',
      sdcDistrict: 'Jaipur',

      // Batch Info
      batchId: 'batch-202',
      batchCode: 'B-26-0002',
      batchName: 'Data Entry Batch A',
      courseName: 'Domestic Data Entry Operator',
      scheme: 'SAMARTH',
      sector: 'Aerospace and Aviation',

      // Status
      enrollmentDate: '2026-09-16',
      trainingStatus: 'ENROLLED',
      biometricVerified: true,
      attendancePercent: 100
    },
    {
      id: 'ASP-RJ-2026-98415',
      aadhaarNo: '321654987123',
      confirmAadhaarNo: '321654987123',
      aadhaarMasked: 'XXXX-XXXX-7123',
      janaadhaarId: '2026554411',
      otherIdType: 'Driving License',
      otherIdNo: 'RJ-01-2022-0044',
      aadhaarDocName: 'Aadhaar_Amit_Choudhary.pdf',
      aadhaarDocSize: '1.1 MB',
      aadhaarDocUrl: '',

      aspirantName: 'Amit Choudhary',
      gender: 'Male',
      relationType: 'Father',
      relationName: 'Bhagwan Ram Choudhary',
      motherName: 'Prem Devi',
      dob: '2000-03-22',
      age: 26,
      educationalQualification: 'ITI / Diploma',
      religion: 'Hindu',
      category: 'OBC',
      minority: 'No',
      specialAbility: 'No',
      disabilityType: '',
      areaType: 'Rural',
      interestedOutOfRajasthan: 'Yes',

      permHouseNo: '34',
      permStreet: 'Kishangarh Road',
      permWard: 'Ward 08',
      permCity: 'Ajmer',
      permDistrict: 'Ajmer District',
      permBlock: 'Kishangarh',
      permTehsil: 'Kishangarh',
      permMunicipality: 'Kishangarh Nagar Parishad',
      permPincode: '305801',
      permAssembly: 'Kishangarh',
      permParliament: 'Ajmer',

      isAddressSame: true,
      commHouseNo: '34',
      commStreet: 'Kishangarh Road',
      commWard: 'Ward 08',
      commCity: 'Ajmer',
      commDistrict: 'Ajmer District',
      commBlock: 'Kishangarh',
      commTehsil: 'Kishangarh',
      commMunicipality: 'Kishangarh Nagar Parishad',
      commPincode: '305801',

      mobileNo: '9828855441',
      altMobileNo: '',
      landlineNo: '',
      email: 'amit.choudhary@example.com',

      bankAccountNo: '10982345678',
      bankAccountName: 'Amit Choudhary',
      bankAccountType: 'Savings',
      bankName: 'State Bank of India',
      bankBranch: 'Kishangarh Main',
      ifscCode: 'SBIN0000456',
      micrCode: '305002008',

      annualFamilyIncome: 140000,
      incomeSlab: '1L-2.5L',
      economicStatus: 'APL',
      economicCardNo: 'RAT-AJ-2026-1029',

      bocwWorker: 'No',
      bocwNo: '',
      mgnregaWorker: 'No',
      mgnregaNo: '',
      isRsby: 'No',
      rsbyNo: '',
      gramsabhaPip: 'No',
      nrlmMember: 'No',
      nrlmNo: '',

      epicNo: 'RJ/02/012/556789',

      preferredSectors: ['Automotive', 'Capital Goods'],
      candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E',
      candidatePhotoName: 'Amit_Photo.jpg',
      documents: [
        { id: 'd1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Proof', fileName: 'Aadhaar_Amit.pdf', fileSize: '1.1 MB', status: 'UPLOADED' },
        { id: 'd2', docType: 'Educational Certificate', docName: 'ITI Certificate Automobile', fileName: 'ITI_Certificate.pdf', fileSize: '1.9 MB', status: 'UPLOADED' }
      ],

      // SDC Center Info
      sdcId: 'sdc-106',
      sdcCode: 'SDC-0006',
      sdcName: 'Bikaner Automotive & Capital Goods Center',
      sdcDistrict: 'Bikaner',

      // Batch Info
      batchId: 'batch-203',
      batchCode: 'B-26-0003',
      batchName: 'Auto Service Batch 01',
      courseName: 'Four Wheeler Service Technician',
      scheme: 'RAJKViK',
      sector: 'Automotive',

      // Status
      enrollmentDate: '2026-09-18',
      trainingStatus: 'ENROLLED',
      biometricVerified: true,
      attendancePercent: 100
    },
    {
      id: 'ASP-RJ-2026-98416',
      aadhaarNo: '741852963147',
      confirmAadhaarNo: '741852963147',
      aadhaarMasked: 'XXXX-XXXX-3147',
      janaadhaarId: '2026338877',
      otherIdType: 'PAN Card',
      otherIdNo: 'RMGRJ9922P',
      aadhaarDocName: 'Aadhaar_Rameshwar.pdf',
      aadhaarDocSize: '1.3 MB',
      aadhaarDocUrl: '',

      aspirantName: 'Rameshwar Gurjar',
      gender: 'Male',
      relationType: 'Father',
      relationName: 'Nandlal Gurjar',
      motherName: 'Shanti Devi',
      dob: '2001-12-05',
      age: 25,
      educationalQualification: '10th Pass',
      religion: 'Hindu',
      category: 'MBC',
      minority: 'No',
      specialAbility: 'No',
      disabilityType: '',
      areaType: 'Rural',
      interestedOutOfRajasthan: 'No',

      permHouseNo: '89',
      permStreet: 'Indraprastha Industrial Area, Ladpura',
      permWard: 'Ward 14',
      permCity: 'Kota',
      permDistrict: 'Kota',
      permBlock: 'Ladpura',
      permTehsil: 'Ladpura',
      permMunicipality: 'Kota Nagar Nigam',
      permPincode: '324005',
      permAssembly: 'Kota South',
      permParliament: 'Kota',

      isAddressSame: true,
      commHouseNo: '89',
      commStreet: 'Indraprastha Industrial Area, Ladpura',
      commWard: 'Ward 14',
      commCity: 'Kota',
      commDistrict: 'Kota',
      commBlock: 'Ladpura',
      commTehsil: 'Ladpura',
      commMunicipality: 'Kota Nagar Nigam',
      commPincode: '324005',

      mobileNo: '9829944112',
      altMobileNo: '',
      landlineNo: '',
      email: 'rameshwar.gurjar@example.com',

      bankAccountNo: '203344556677',
      bankAccountName: 'Rameshwar Gurjar',
      bankAccountType: 'Savings',
      bankName: 'Punjab National Bank',
      bankBranch: 'Indraprastha Kota',
      ifscCode: 'PUNB0245600',
      micrCode: '324024005',

      annualFamilyIncome: 110000,
      incomeSlab: '1L-2.5L',
      economicStatus: 'APL',
      economicCardNo: 'RAT-KT-2026-8812',

      bocwWorker: 'No',
      bocwNo: '',
      mgnregaWorker: 'No',
      mgnregaNo: '',
      isRsby: 'No',
      rsbyNo: '',
      gramsabhaPip: 'No',
      nrlmMember: 'No',
      nrlmNo: '',

      epicNo: 'RJ/03/019/331902',

      preferredSectors: ['Capital Goods', 'Construction'],
      candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E',
      candidatePhotoName: 'Rameshwar_Photo.jpg',
      documents: [
        { id: 'd1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: 'Aadhaar_Rameshwar.pdf', fileSize: '1.3 MB', status: 'UPLOADED' },
        { id: 'd2', docType: 'Educational Certificate', docName: '10th Board Certificate', fileName: 'Class_10.pdf', fileSize: '1.4 MB', status: 'UPLOADED' }
      ],

      // SDC Center Info
      sdcId: 'sdc-101',
      sdcCode: 'SDC-0001',
      sdcName: 'Jaipur Skill Center',
      sdcDistrict: 'Jaipur',

      // Batch Info
      batchId: 'batch-201',
      batchCode: 'B-26-0001',
      batchName: 'Solar Tech Batch 01',
      courseName: 'Domestic Data Entry Operator',
      scheme: 'SAMARTH',
      sector: 'Aerospace and Aviation',

      // Status
      enrollmentDate: '2026-09-20',
      trainingStatus: 'IN_TRAINING',
      biometricVerified: true,
      attendancePercent: 92
    },
    {
      id: 'ASP-RJ-2026-98417',
      aadhaarNo: '951753456852',
      confirmAadhaarNo: '951753456852',
      aadhaarMasked: 'XXXX-XXXX-6852',
      janaadhaarId: '2026119955',
      otherIdType: 'PAN Card',
      otherIdNo: 'KVTBT4433D',
      aadhaarDocName: 'Aadhaar_Kavita_Bhati.pdf',
      aadhaarDocSize: '1.5 MB',
      aadhaarDocUrl: '',

      aspirantName: 'Kavita Bhati',
      gender: 'Female',
      relationType: 'Father',
      relationName: 'Prabhu Dayal Bhati',
      motherName: 'Kishori Devi',
      dob: '2004-02-18',
      age: 22,
      educationalQualification: '12th Pass',
      religion: 'Hindu',
      category: 'OBC',
      minority: 'No',
      specialAbility: 'No',
      disabilityType: '',
      areaType: 'Rural',
      interestedOutOfRajasthan: 'No',

      permHouseNo: '18-A',
      permStreet: 'Mandore Industrial Area',
      permWard: 'Ward 06',
      permCity: 'Jodhpur',
      permDistrict: 'Jodhpur',
      permBlock: 'Mandore',
      permTehsil: 'Mandore',
      permMunicipality: 'Jodhpur Nagar Nigam',
      permPincode: '342001',
      permAssembly: 'Sardarshahar',
      permParliament: 'Jodhpur',

      isAddressSame: true,
      commHouseNo: '18-A',
      commStreet: 'Mandore Industrial Area',
      commWard: 'Ward 06',
      commCity: 'Jodhpur',
      commDistrict: 'Jodhpur',
      commBlock: 'Mandore',
      commTehsil: 'Mandore',
      commMunicipality: 'Jodhpur Nagar Nigam',
      commPincode: '342001',

      mobileNo: '9828114499',
      altMobileNo: '',
      landlineNo: '',
      email: 'kavita.bhati@example.com',

      bankAccountNo: '445566778899',
      bankAccountName: 'Kavita Bhati',
      bankAccountType: 'Savings',
      bankName: 'ICICI Bank',
      bankBranch: 'Mandore Branch',
      ifscCode: 'ICIC0003412',
      micrCode: '342229003',

      annualFamilyIncome: 130000,
      incomeSlab: '1L-2.5L',
      economicStatus: 'APL',
      economicCardNo: 'RAT-JD-2026-3390',

      bocwWorker: 'No',
      bocwNo: '',
      mgnregaWorker: 'No',
      mgnregaNo: '',
      isRsby: 'No',
      rsbyNo: '',
      gramsabhaPip: 'No',
      nrlmMember: 'Yes',
      nrlmNo: 'NRLM/RJ/JD/8812',

      epicNo: 'RJ/04/008/119934',

      preferredSectors: ['Apparel', 'IT & ITeS'],
      candidatePhotoUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E',
      candidatePhotoName: 'Kavita_Bhati.jpg',
      documents: [
        { id: 'd1', docType: 'Aadhaar Card', docName: 'Aadhaar Card Copy', fileName: 'Aadhaar_Kavita.pdf', fileSize: '1.5 MB', status: 'UPLOADED' },
        { id: 'd2', docType: 'Educational Certificate', docName: 'Senior Secondary Marksheet', fileName: 'Class_12.pdf', fileSize: '1.7 MB', status: 'UPLOADED' }
      ],

      // SDC Center Info
      sdcId: 'sdc-106',
      sdcCode: 'SDC-0006',
      sdcName: 'Bikaner Automotive & Capital Goods Center',
      sdcDistrict: 'Bikaner',

      // Batch Info
      batchId: 'batch-203',
      batchCode: 'B-26-0003',
      batchName: 'Auto Service Batch 01',
      courseName: 'Four Wheeler Service Technician',
      scheme: 'RAJKViK',
      sector: 'Automotive',

      // Status
      enrollmentDate: '2026-09-22',
      trainingStatus: 'ENROLLED',
      biometricVerified: true,
      attendancePercent: 100
    }
]);