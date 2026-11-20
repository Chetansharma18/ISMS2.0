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

/** Response of verify-login-token, select-role and two-step/verify (fields shared by all three). */
export interface LoginStepResponse {
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

/** Response of GET /auth/me. */
export interface CurrentUserResponse extends BackendUser {
  roles?: string[];
  permissions?: string[];
}

/** Response of POST /auth/logout. */
export interface LogoutResponse {
  success?: boolean;
  message?: string;
  /** Page that completes the sign-out at RajSSO. */
  redirectUrl?: string | null;
}
