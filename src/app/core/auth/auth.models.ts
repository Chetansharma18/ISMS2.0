export interface LoginCredentials {
  ssoId: string;
  password?: string;
  captcha?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  expiresAt: number;
}
