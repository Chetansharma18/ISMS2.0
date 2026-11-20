import type { AspirantFormData } from '../config/aspirant-form.config';

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
