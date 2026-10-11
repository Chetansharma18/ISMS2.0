/** A user account row managed from the admin User Management screen. */
export interface UserManagementItem {
  sNo: number;
  id: string;
  userId: string;
  username: string;
  ssoId: string;
  userType: 'Admin' | 'Super Admin' | 'TP';
  roleType: string;
  designation?: string;
  schemeDepartment?: string;
  districtName: string;
  blockName?: string;
  email?: string;
  mobileNo?: string;
  schemeStatus: 'Active' | 'Inactive' | 'Blacklisted';
}
