/** Shapes the backend auth endpoints return (only the fields the frontend reads). */

export interface BackendRoleSummary {
  id: number;
  name: string;
}

export interface BackendUser {
  id: number;
  SSOID: string;
  name?: string;
  displayName?: string;
  email?: string;
  mobile?: string;
  /** verify-login-token / select-role send `{ id, name }`; `me` sends role names. */
  roles?: (BackendRoleSummary | string)[];
}

/** Second-factor methods the backend accepts. */
export type TwoStepMethod = 'OTP' | 'PIN';

/** Whether one second-factor method is allowed for the role and already set up for the user. */
export interface TwoStepMethodStatus {
  allowed: boolean;
  isSet: boolean;
  /** "Configured", "Not configured", or the masked mobile number. */
  details?: string;
}

/** `twoStepStatus` of a 2FA challenge: only the methods the role allows are present. */
export interface TwoStepStatus {
  pin?: TwoStepMethodStatus;
  mobile?: TwoStepMethodStatus;
  authApp?: TwoStepMethodStatus;
}

/** Response of verify-login-token, select-role and two-step/verify (fields shared by all three). */
export interface LoginStepResponse {
  /** 2FA challenge: which allowed methods the user has set up. */
  twoStepStatus?: TwoStepStatus | null;
  /** 2FA challenge where no allowed method is set up yet: lets the user set one up before signing in (15 min). */
  setupToken?: string | null;
  setupExpiresAt?: string | null;
  verified?: boolean;
  success?: boolean;
  requiresRoleSelection?: boolean;
  requires2FA?: boolean;
  allowedMethods?: string[];
  selectedRoleId?: number;
  message?: string;
  user?: BackendUser;
  /** Only for mobile clients; web sessions use HttpOnly cookies. */
  accessToken?: string | null;
  token?: string | null;
}

/** Response of GET /auth/me. Scoped to the role chosen at sign-in: `roles` holds only that role. */
export interface CurrentUserResponse extends BackendUser {
  roles?: string[];
  permissions?: string[];
  /** The role the session was opened with (from the token's `selected_role_id`). */
  selectedRoleId?: number | null;
  selectedRole?: BackendRoleSummary | null;
  /** All active roles of the user, for "Switch Role" (requested from the backend; used when present). */
  availableRoles?: BackendRoleSummary[] | null;
}

/** Response of POST /auth/logout. */
export interface LogoutResponse {
  success?: boolean;
  message?: string;
  /** Page that completes the sign-out at RajSSO. */
  redirectUrl?: string | null;
}
