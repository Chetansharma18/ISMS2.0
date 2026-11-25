import { UserRole } from './role.model';

export interface UserPersona {
  id: string;
  ssoId: string;
  label: string;
  subLabel: string;
  role: UserRole;
  isProfileComplete?: boolean;
}

export interface UserProfile {
  id: string;
  ssoId: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  entityName?: string;
  designation?: string;
  isVerified?: boolean;
}
