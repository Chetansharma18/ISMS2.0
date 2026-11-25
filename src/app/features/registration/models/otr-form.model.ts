import { REGEX_PATTERNS } from '../../../shared/utils/validators.util';

export interface FileDoc {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'empty' | 'uploading' | 'uploaded';
  fileUrl?: string;
}

export interface FinancialYearEntry {
  year: string;         // e.g. '2025-26'
  totalTurnover: string; // in Lacs
  skillTurnover: string; // in Lacs
}

export interface Step1OrgDetails {
  shortName: string;
  fullName: string;
  natureOfEntity: string;
  registrationNumber: string;
  dateOfRegistration: string;
  stateOfLegalReg: string;
  registrationCertDoc: FileDoc | null;

  companyPan: string;
  panCardDoc: FileDoc | null;
  gstRegistered: 'Yes' | 'No';
  gstin: string;
  gstCertDoc: FileDoc | null;
  msmeRegistered: 'Yes' | 'No';
  udyamNumber: string;
  msmeCertDoc: FileDoc | null;

  turnOver: string;                  // legacy single-field, kept for compatibility
  financialYears: FinancialYearEntry[]; // NEW: dynamic financial year rows
  turnoverCertDoc: FileDoc | null;      // NEW: CA-certified turnover certificate
  blackListed: 'Yes' | 'No';
  nsdcPartner: string;
  /** Sector the organisation prefers to train in (a Sector Master name). */
  preferredSector: string;
  contactNo: string;
  emailId: string;
  website: string;

  registeredAddress: string;
  registeredState: string;
  registeredDistrict: string;
  registeredPincode: string;
  sameAsRegistered: boolean;
  officeAddress: string;
  officeState: string;
  officeDistrict: string;
  officePincode: string;
}

export interface OfficerInCharge {
  id: string;
  name: string;
  designation: string;
  mobileNo: string;
  emailId: string;
  pan: string;
  aadhaarNo: string;
  bhamashahNo: string;
  voterIdNo: string;
  passportNo: string;
  appointmentLetterDoc: FileDoc | null;
  idProofDoc: FileDoc | null;
  isExpanded?: boolean;
}

export const IDENTITY_DOCUMENT_TYPES: string[] = [
  'Aadhaar Card',
  'PAN Card',
  'Voter ID Card',
  'Jan Aadhaar Card',
  'Passport'
];

export interface Step3AuthorizedPerson {
  firstName?: string;
  lastName?: string;
  name: string;
  designation: string;
  identityDocType?: string;
  identityDocNumber?: string;
  pan: string;
  emailId: string;
  mobileNo: string;
  aadhaarNo: string;
  bhamashahNo: string;
  voterIdNo: string;
  passportNo: string;
  state: string;
  residenceAddress: string;
  authorizationLetterDoc: FileDoc | null;
  idProofDoc: FileDoc | null;
  dob: string;
  age: string;
}

export interface Step4BankDetails {
  bankName: string;
  branchName: string;
  transferMode?: string;
  accountType?: string;
  accountHolderName: string;
  accountNo: string;
  ifscCode: string;
  micrCode: string;
  branchAddress?: string;
  cancelledChequeDoc: FileDoc | null;
}

export interface OtrFormData {
  step1: Step1OrgDetails;
  step2: OfficerInCharge[];
  step3: Step3AuthorizedPerson;
  step4: Step4BankDetails;
  step5DeclarationAgreed: boolean;
  status: 'Draft' | 'Submitted';
  registrationId?: string;
  submittedAt?: string;
}

export interface ToastInfo {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  stepNumber?: number;
}

/* ==========================================================================
   Master Constants & Dropdown Lookups
   ========================================================================== */

export const NATURE_OF_ENTITIES: string[] = [
  'SOCIETY',
  'PUBLIC LIMITED',
  'PRIVATE LIMITED',
  'GOVERNMENT ORGANIZATION',
  'TRUST',
  'NA'
];

export const DESIGNATIONS_MASTER: string[] = [
  'Managing Director (MD)',
  'Chief Executive Officer (CEO)',
  'Director / Partner',
  'President / Chairman',
  'Secretary / Trustee',
  'General Manager (GM)',
  'State Project Head',
  'Operations Head',
  'Authorized Representative',
  'Other'
];

export const STATES_MASTER: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const DISTRICTS_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 'Chittoor',
    'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna',
    'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam',
    'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
    'Vizianagaram', 'West Godavari', 'YSR Kadapa'
  ],
  'Arunachal Pradesh': [
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Itanagar', 'Kamle',
    'Kra Daadi', 'Kurung Kumey', 'Leparada', 'Lohit', 'Longding', 'Lower Dibang Valley',
    'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi',
    'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  Assam: [
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang',
    'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai',
    'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
    'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur',
    'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ],
  Bihar: [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar',
    'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar',
    'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur',
    'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran',
    'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'
  ],
  Chhattisgarh: [
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada',
    'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur',
    'Kabirdham', 'Kanker', 'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon', 'Korba', 'Koriya',
    'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli',
    'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sakti', 'Sarangarh-Bilaigarh', 'Sukma',
    'Surajpur', 'Surguja'
  ],
  Goa: [
    'North Goa', 'South Goa'
  ],
  Gujarat: [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad',
    'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
    'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
    'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
  ],
  Haryana: [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar',
    'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula',
    'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  'Himachal Pradesh': [
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi',
    'Shimla', 'Sirmaur', 'Solan', 'Una'
  ],
  Jharkhand: [
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih',
    'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga',
    'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ],
  Karnataka: [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
    'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada',
    'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar',
    'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi',
    'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
  ],
  Kerala: [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode',
    'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind',
    'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar',
    'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua',
    'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur',
    'Neemuch', 'Niwari', 'Panna', 'Pandhurna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar',
    'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli',
    'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
  ],
  Maharashtra: [
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur',
    'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
    'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad',
    'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg',
    'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  Manipur: [
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching',
    'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
  ],
  Meghalaya: [
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Eastern West Khasi Hills',
    'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills',
    'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'
  ],
  Mizoram: [
    'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit',
    'Saiha', 'Saitual', 'Serchhip'
  ],
  Nagaland: [
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Niuland',
    'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'
  ],
  Odisha: [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh',
    'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi',
    'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj',
    'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
  ],
  Punjab: [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur',
    'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa',
    'Moga', 'Mohali', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur',
    'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
  ],
  Rajasthan: [
    'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer', 'Beawar', 'Bharatpur',
    'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Deeg', 'Didwana-Kuchaman',
    'Dholpur', 'Dungarpur', 'Ganganagar', 'Gangapurcity', 'Hanumangarh', 'Hindaun', 'Jaipur',
    'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural',
    'Karauli', 'Kekri', 'Khairthal-Tijara', 'Kota', 'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana',
    'Pali', 'Phalodi', 'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur',
    'Shahpura', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur'
  ],
  Sikkim: [
    'Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
  ],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
    'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai',
    'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
    'Thiruvallur', 'Thiruvarur', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur',
    'Tiruppur', 'Tiruvannamalai', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ],
  Telangana: [
    'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad', 'Jagtial', 'Jangaon',
    'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam',
    'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak',
    'Medchal Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
    'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet',
    'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
  ],
  Tripura: [
    'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh',
    'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti',
    'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah',
    'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad',
    'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun',
    'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
    'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura',
    'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
    'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
    'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra',
    'Sultanpur', 'Unnao', 'Varanasi'
  ],
  Uttarakhand: [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital',
    'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly',
    'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
    'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman',
    'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
  ],
  'Andaman and Nicobar Islands': [
    'Nicobar', 'North and Middle Andaman', 'South Andaman'
  ],
  Chandigarh: [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Dadra and Nagar Haveli', 'Daman', 'Diu'
  ],
  Delhi: [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
  ],
  'Jammu and Kashmir': [
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua',
    'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi',
    'Samba', 'Shopian', 'Srinagar', 'Udhampur'
  ],
  Ladakh: [
    'Kargil', 'Leh'
  ],
  Lakshadweep: [
    'Lakshadweep'
  ],
  Puducherry: [
    'Karaikal', 'Mahe', 'Puducherry', 'Yanam'
  ]
};

export const BANKS_MASTER: string[] = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Canara Bank',
  'Union Bank of India',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Rajasthan Marudhara Gramin Bank',
  'Baroda Rajasthan Kshetriya Gramin Bank',
  'Other'
];

export const TRANSFER_MODES: string[] = ['NEFT', 'RTGS', 'IMPS'];

export const ACCOUNT_TYPES: string[] = ['Current', 'Savings', 'Other'];

export const NSDC_PARTNER_TYPES: string[] = [
  'Not Applicable',
  'Non-Funded Partner',
  'Loan Funded Partner',
  'Equity Share Partner'
];

/* ==========================================================================
   Statutory Validation Regular Expressions
   ========================================================================== */

// Shared patterns come from shared/utils/validators.util. Only registration-specific
// rules (UDYAM, MICR, URL, and the looser 12-digit AADHAAR / case-insensitive PASSPORT
// this form has always accepted) are defined locally.
export const REGEX = {
  PAN: REGEX_PATTERNS.PAN,
  GSTIN: REGEX_PATTERNS.GSTIN,
  UDYAM: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i,
  INDIAN_MOBILE: REGEX_PATTERNS.MOBILE,
  INDIAN_PIN: REGEX_PATTERNS.PINCODE,
  AADHAAR: /^\d{12}$/,
  VOTER_ID: REGEX_PATTERNS.VOTER_ID,
  PASSPORT: /^[A-Z]\d{7}$/i,
  IFSC: REGEX_PATTERNS.IFSC,
  MICR: /^\d{9}$/,
  BANK_ACCOUNT: REGEX_PATTERNS.BANK_ACCOUNT,
  EMAIL: REGEX_PATTERNS.EMAIL,
  URL: /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(com|org|in|net|gov|edu|biz|info|co|io|tech|ai|me|app|dev|online|site|store|global|co\.in|org\.in|net\.in|gov\.in|nic\.in|ac\.in|edu\.in|gen\.in|res\.in)(\/[^\s]*)?$/i
};

export function createInitialOtrFormData(): OtrFormData {
  return {
    step1: {
      shortName: '',
      fullName: '',
      natureOfEntity: '',
      registrationNumber: '',
      dateOfRegistration: '',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: null,
      companyPan: '',
      panCardDoc: null,
      gstRegistered: 'No',
      gstin: '',
      gstCertDoc: null,
      msmeRegistered: 'No',
      udyamNumber: '',
      msmeCertDoc: null,
      turnOver: '',
      financialYears: [
        { year: '2025-26', totalTurnover: '', skillTurnover: '' },
        { year: '2024-25', totalTurnover: '', skillTurnover: '' },
        { year: '2023-24', totalTurnover: '', skillTurnover: '' }
      ],
      turnoverCertDoc: null,
      blackListed: 'No',
      nsdcPartner: 'Not Applicable',
      preferredSector: '',
      contactNo: '',
      emailId: '',
      website: '',
      registeredAddress: '',
      registeredState: 'Rajasthan',
      registeredDistrict: '',
      registeredPincode: '',
      sameAsRegistered: false,
      officeAddress: '',
      officeState: 'Rajasthan',
      officeDistrict: '',
      officePincode: ''
    },
    step2: [
      {
        id: 'oic-1',
        name: '',
        designation: '',
        mobileNo: '',
        emailId: '',
        pan: '',
        aadhaarNo: '',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: null,
        idProofDoc: null,
        isExpanded: true
      }
    ],
    step3: {
      firstName: '',
      lastName: '',
      name: '',
      designation: '',
      identityDocType: 'Aadhaar Card',
      identityDocNumber: '',
      pan: '',
      emailId: '',
      mobileNo: '',
      aadhaarNo: '',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: '',
      authorizationLetterDoc: null,
      idProofDoc: null,
      dob: '',
      age: ''
    },
    step4: {
      bankName: '',
      branchName: '',
      transferMode: '',
      accountType: '',
      accountHolderName: '',
      accountNo: '',
      ifscCode: '',
      micrCode: '',
      branchAddress: '',
      cancelledChequeDoc: null
    },
    step5DeclarationAgreed: true,
    status: 'Draft'
  };
}

export function createExistingUserOtrData(): OtrFormData {
  return {
    step1: {
      shortName: 'Company 1',
      fullName: 'Company 1',
      natureOfEntity: 'Private Limited',
      registrationNumber: 'U80302RJ2022NPL079811',
      dateOfRegistration: '2022-04-15',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: {
        fileName: 'CIN_Incorporation_Cert_2022.pdf',
        fileSize: '1.8 MB',
        uploadDate: '15-Apr-2022',
        status: 'uploaded'
      },
      companyPan: 'AAACR1234F',
      panCardDoc: {
        fileName: 'Company_PAN_Verified.pdf',
        fileSize: '850 KB',
        uploadDate: '15-Apr-2022',
        status: 'uploaded'
      },
      gstRegistered: 'Yes',
      gstin: '08AAACR1234F1Z5',
      gstCertDoc: {
        fileName: 'GST_Registration_Certificate.pdf',
        fileSize: '1.2 MB',
        uploadDate: '20-Apr-2022',
        status: 'uploaded'
      },
      msmeRegistered: 'Yes',
      udyamNumber: 'UDYAM-RJ-14-0019284',
      msmeCertDoc: {
        fileName: 'Udyam_Certificate.pdf',
        fileSize: '950 KB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      turnOver: '450.00',
      financialYears: [
        { year: '2025-26', totalTurnover: '180.00', skillTurnover: '72.00' },
        { year: '2024-25', totalTurnover: '150.00', skillTurnover: '60.00' },
        { year: '2023-24', totalTurnover: '120.00', skillTurnover: '48.00' }
      ],
      turnoverCertDoc: {
        fileName: 'CA_Certified_Turnover_Certificate.pdf',
        fileSize: '1.3 MB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      blackListed: 'No',
      nsdcPartner: 'Non-Funded Partner',
      preferredSector: 'Electronics',
      contactNo: '0141-2700891',
      emailId: 'contact@skilltech.org',
      website: 'https://www.skilltech.org',
      registeredAddress: 'Plot No. 42, Institutional Area, Jhalana Doongri',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302004',
      sameAsRegistered: true,
      officeAddress: 'Plot No. 42, Institutional Area, Jhalana Doongri',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302004'
    },
    step2: [
      {
        id: 'oic-1',
        name: 'Dr. Rajesh Sharma',
        designation: 'Managing Director (MD)',
        mobileNo: '9829012345',
        emailId: 'rajesh.sharma@skilltech.org',
        pan: 'ABCPS1234K',
        aadhaarNo: '987654321098',
        bhamashahNo: 'BHM889210',
        voterIdNo: 'RJX1409812',
        passportNo: 'Z9876543',
        appointmentLetterDoc: {
          fileName: 'MD_Appointment_Letter.pdf',
          fileSize: '1.1 MB',
          uploadDate: '15-Apr-2022',
          status: 'uploaded'
        },
        idProofDoc: {
          fileName: 'MD_Aadhaar_PAN.pdf',
          fileSize: '1.4 MB',
          uploadDate: '15-Apr-2022',
          status: 'uploaded'
        },
        isExpanded: true
      },
      {
        id: 'oic-2',
        name: 'Sunita Verma',
        designation: 'Operations Head',
        mobileNo: '9414098765',
        emailId: 'sunita.verma@skilltech.org',
        pan: 'ABQPV5678L',
        aadhaarNo: '876543210987',
        bhamashahNo: 'BHM441092',
        voterIdNo: 'RJX1409865',
        passportNo: '',
        appointmentLetterDoc: {
          fileName: 'Operations_Head_Order.pdf',
          fileSize: '980 KB',
          uploadDate: '10-May-2022',
          status: 'uploaded'
        },
        idProofDoc: null,
        isExpanded: false
      }
    ],
    step3: {
      firstName: 'Vikram',
      lastName: 'Singh Mehta',
      name: 'Vikram Singh Mehta',
      designation: 'Authorized Representative',
      identityDocType: 'Aadhaar Card',
      identityDocNumber: '765432109876',
      pan: 'BNYPM9876Q',
      emailId: 'vikram.mehta@skilltech.org',
      mobileNo: '9829154321',
      aadhaarNo: '765432109876',
      bhamashahNo: 'BHM771209',
      voterIdNo: 'RJX1409871',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'B-14, Malviya Nagar, Jaipur, Rajasthan - 302017',
      authorizationLetterDoc: {
        fileName: 'Board_Resolution_Authorization.pdf',
        fileSize: '2.1 MB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      idProofDoc: {
        fileName: 'Auth_Signatory_ID_Proof.pdf',
        fileSize: '1.2 MB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      dob: '1982-08-14',
      age: '44'
    },
    step4: {
      bankName: 'State Bank of India',
      branchName: 'Secretariat Branch, Jaipur',
      accountHolderName: 'Company 1',
      accountNo: '3948201948201',
      ifscCode: 'SBIN0001234',
      micrCode: '302002011',
      branchAddress: 'Government Secretariat Campus, Bhagwan Das Road, Jaipur',
      cancelledChequeDoc: {
        fileName: 'Cancelled_Cheque_Verified.pdf',
        fileSize: '850 KB',
        uploadDate: '25-Apr-2022',
        status: 'uploaded'
      }
    },
    step5DeclarationAgreed: true,
    status: 'Submitted',
    registrationId: 'RJ-OTR-2026-004819',
    submittedAt: '15-May-2022 11:30 AM'
  };
}

