import type { AspirantFormData } from '../../../features/sdc/config/aspirant-form.config';

/** The details an outside source (Expressed Interest, Employment Department) can give about an aspirant. */
export type AspirantSourceProfile = Pick<
  AspirantFormData,
  | 'aadhaarNo'
  | 'aspirantName'
  | 'gender'
  | 'relationType'
  | 'relationName'
  | 'dob'
  | 'educationalQualification'
  | 'religion'
  | 'category'
  | 'areaType'
  | 'mobileNo'
  | 'email'
  | 'permCity'
  | 'permDistrict'
  | 'permPincode'
>;

/** An aspirant who expressed interest in a course on the aspirant portal. */
export interface ExpressedInterestApplicant extends AspirantSourceProfile {
  id: string;
  course: string;
  sector: string;
  /** dd/mm/yyyy */
  expressedOn: string;
}

/** An aspirant registered with the Employment Department. */
export interface EmploymentDeptRecord extends AspirantSourceProfile {
  /** Registration number the Employment Department knows the aspirant by. */
  registrationNo: string;
  /** Sector the aspirant is looking for work in. */
  sector: string;
  /** dd/mm/yyyy */
  registeredOn: string;
}

interface Person {
  name: string;
  gender: 'Male' | 'Female';
  dob: string;
  education: string;
  category: string;
  district: string;
  city: string;
  pincode: string;
}

/** Dummy aspirant number `n`: the Aadhaar, mobile and e-mail are made-up values that follow the number. */
function profile(n: number, person: Person): AspirantSourceProfile {
  const two = String(n).padStart(2, '0');
  return {
    aadhaarNo: `9999000000${two}`,
    aspirantName: person.name,
    gender: person.gender,
    relationType: person.gender === 'Male' ? 'Father' : 'Husband',
    relationName: `Guardian of Aspirant ${n}`,
    dob: person.dob,
    educationalQualification: person.education,
    religion: 'Hindu',
    category: person.category,
    areaType: 'Urban',
    mobileNo: `90000000${two}`,
    email: `aspirant${n}@example.com`,
    permCity: person.city,
    permDistrict: person.district,
    permPincode: person.pincode
  };
}

const person = (
  name: string,
  gender: 'Male' | 'Female',
  dob: string,
  education: string,
  category: string,
  district: string,
  city: string,
  pincode: string
): Person => ({ name, gender, dob, education, category, district, city, pincode });

const interest = (
  n: number,
  p: Person,
  course: string,
  sector: string,
  expressedOn: string
): ExpressedInterestApplicant => ({ ...profile(n, p), id: `ei-${n}`, course, sector, expressedOn });

/**
 * Aspirants who expressed interest in the courses of the sample batches, so every sample batch has some to pick from.
 * The names are neutral placeholders.
 */
export const EXPRESSED_INTEREST_APPLICANTS: ExpressedInterestApplicant[] = [
  interest(1, person('Aspirant 1', 'Male', '2002-03-14', '12th Pass', 'General', 'Jaipur', 'Jaipur', '302001'), 'Domestic Data Entry Operator', 'Aerospace and Aviation', '02/10/2026'),
  interest(2, person('Aspirant 2', 'Female', '2003-07-21', 'Graduate', 'OBC', 'Jaipur', 'Sanganer', '302029'), 'Domestic Data Entry Operator', 'Aerospace and Aviation', '03/10/2026'),
  interest(3, person('Aspirant 3', 'Male', '2001-11-05', '12th Pass', 'SC', 'Jaipur', 'Chomu', '303702'), 'Domestic Data Entry Operator', 'Aerospace and Aviation', '04/10/2026'),
  interest(4, person('Aspirant 4', 'Male', '2000-01-18', 'ITI', 'General', 'Bikaner', 'Bikaner', '334001'), 'Four Wheeler Service Technician', 'Automotive', '01/10/2026'),
  interest(5, person('Aspirant 5', 'Male', '2002-09-09', 'Diploma', 'OBC', 'Bikaner', 'Nokha', '334803'), 'Four Wheeler Service Technician', 'Automotive', '02/10/2026'),
  interest(6, person('Aspirant 6', 'Male', '2001-05-30', '10th Pass', 'ST', 'Kota', 'Kota', '324001'), 'Electric Vehicle Service Technician', 'Automotive', '03/10/2026'),
  interest(7, person('Aspirant 7', 'Male', '2003-02-12', 'ITI', 'General', 'Kota', 'Ramganj Mandi', '326519'), 'Electric Vehicle Service Technician', 'Automotive', '05/10/2026'),
  interest(8, person('Aspirant 8', 'Female', '2002-06-25', 'Diploma', 'General', 'Jaipur', 'Jaipur', '302017'), 'Solar PV Rooftop Grid-Tie Installer', 'Green Jobs', '01/10/2026'),
  interest(9, person('Aspirant 9', 'Male', '2000-12-02', 'ITI', 'OBC', 'Jaipur', 'Bagru', '303007'), 'Solar PV Rooftop Grid-Tie Installer', 'Green Jobs', '02/10/2026'),
  interest(10, person('Aspirant 10', 'Male', '2001-08-16', '12th Pass', 'SC', 'Ajmer', 'Beawar', '305901'), 'Solar PV Rooftop Grid-Tie Installer', 'Green Jobs', '04/10/2026'),
  interest(11, person('Aspirant 11', 'Male', '2002-04-08', 'ITI', 'General', 'Bikaner', 'Bikaner', '334003'), 'CNC Operator Turning', 'Capital Goods', '02/10/2026'),
  interest(12, person('Aspirant 12', 'Male', '2001-10-27', 'Diploma', 'OBC', 'Churu', 'Sardarshahar', '331403'), 'CNC Operator Turning', 'Capital Goods', '05/10/2026'),
  interest(13, person('Aspirant 13', 'Female', '2003-01-19', '12th Pass', 'General', 'Udaipur', 'Udaipur', '313001'), 'General Duty Assistant (GDA)', 'Healthcare', '01/10/2026'),
  interest(14, person('Aspirant 14', 'Female', '2002-05-11', '12th Pass', 'ST', 'Udaipur', 'Salumbar', '313027'), 'General Duty Assistant (GDA)', 'Healthcare', '03/10/2026'),
  interest(15, person('Aspirant 15', 'Female', '2001-09-23', 'Graduate', 'EWS', 'Chittorgarh', 'Chittorgarh', '312001'), 'General Duty Assistant (GDA)', 'Healthcare', '06/10/2026'),
  interest(16, person('Aspirant 16', 'Male', '2002-07-07', '12th Pass', 'General', 'Jodhpur', 'Jodhpur', '342001'), 'Retail Sales Associate', 'Retail', '02/10/2026'),
  interest(17, person('Aspirant 17', 'Female', '2003-03-03', 'Graduate', 'OBC', 'Jodhpur', 'Osian', '342303'), 'Retail Sales Associate', 'Retail', '04/10/2026')
];

const employment = (n: number, p: Person, sector: string, registeredOn: string): EmploymentDeptRecord => ({
  ...profile(n, p),
  registrationNo: `EMP-RJ-${String(n - 20).padStart(4, '0')}`,
  sector,
  registeredOn
});

/**
 * Aspirants registered with the Employment Department; the dummy source the "Employment Department" option reads.
 * Spread over the sectors and districts of the sample batches so each one has records to show.
 */
export const EMPLOYMENT_DEPT_RECORDS: EmploymentDeptRecord[] = [
  employment(21, person('Aspirant 21', 'Male', '1999-04-10', 'Graduate', 'General', 'Jaipur', 'Jaipur', '302004'), 'Aerospace and Aviation', '12/01/2024'),
  employment(22, person('Aspirant 22', 'Female', '2000-08-22', '12th Pass', 'OBC', 'Jaipur', 'Sanganer', '302029'), 'Aerospace and Aviation', '03/03/2024'),
  employment(23, person('Aspirant 23', 'Male', '1998-12-15', 'Diploma', 'SC', 'Jaipur', 'Jaipur', '302017'), 'Green Jobs', '27/06/2024'),
  employment(24, person('Aspirant 24', 'Male', '2001-02-28', 'ITI', 'General', 'Jaipur', 'Bagru', '303007'), 'Green Jobs', '14/09/2024'),
  employment(25, person('Aspirant 25', 'Male', '2002-10-06', '10th Pass', 'ST', 'Jaipur', 'Chomu', '303702'), 'Retail', '08/11/2024'),
  employment(26, person('Aspirant 26', 'Male', '1997-06-19', 'Post Graduate', 'EWS', 'Bikaner', 'Bikaner', '334001'), 'Automotive', '21/02/2025'),
  employment(27, person('Aspirant 27', 'Male', '2000-03-11', 'ITI', 'OBC', 'Bikaner', 'Nokha', '334803'), 'Automotive', '02/03/2025'),
  employment(28, person('Aspirant 28', 'Male', '1999-09-29', 'Diploma', 'General', 'Bikaner', 'Bikaner', '334003'), 'Capital Goods', '19/03/2025'),
  employment(29, person('Aspirant 29', 'Male', '2001-07-14', 'ITI', 'SC', 'Kota', 'Kota', '324005'), 'Automotive', '05/04/2025'),
  employment(30, person('Aspirant 30', 'Male', '2002-01-23', 'Diploma', 'General', 'Kota', 'Ramganj Mandi', '326519'), 'Automotive', '22/04/2025'),
  employment(31, person('Aspirant 31', 'Female', '2002-11-30', '12th Pass', 'General', 'Udaipur', 'Udaipur', '313001'), 'Healthcare', '10/05/2025'),
  employment(32, person('Aspirant 32', 'Female', '2001-04-04', '12th Pass', 'ST', 'Udaipur', 'Salumbar', '313027'), 'Healthcare', '26/05/2025'),
  employment(33, person('Aspirant 33', 'Female', '2003-02-17', 'Graduate', 'OBC', 'Jodhpur', 'Jodhpur', '342001'), 'Retail', '11/06/2025'),
  employment(34, person('Aspirant 34', 'Male', '2000-06-08', '12th Pass', 'General', 'Jodhpur', 'Osian', '342303'), 'Retail', '30/06/2025')
];
