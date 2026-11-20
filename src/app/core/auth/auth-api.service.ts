import { Injectable, inject } from '@angular/core';
import { Observable, finalize, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api.config';
import { HttpService } from '../http/http.service';
import type { CurrentUserResponse, LoginStepResponse, LogoutResponse, TwoStepMethod } from './auth-api.models';
import { TokenService } from './token.service';

/** Whatever token fields a session / refresh response carries; all optional because cookie sessions send none. */
interface TokenResponse {
  accessToken?: string | null;
  token?: string | null;
  data?: { accessToken?: string | null; token?: string | null } | null;
}

function extractAccessToken(res: TokenResponse | null | undefined): string | null {
  return res?.accessToken ?? res?.token ?? res?.data?.accessToken ?? res?.data?.token ?? null;
}

/**
 * Backend calls of the session itself. The sign-in steps (login token, role, second factor) carry their one-time
 * tokens in HttpOnly cookies set by the backend, so the bodies only hold the user's choices.
 * Used by SsoLoginFlowService, AuthService and the auth interceptor; screens never call these directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpService);
  private readonly tokens = inject(TokenService);
  private refreshInFlight$: Observable<void> | null = null;

  private get client(): string {
    return environment.api.clientId;
  }

  // ---- Sign-in steps ------------------------------------------------------------------------

  /** Exchanges the login_callback_token cookie (set by the SSO callback) for the session or the next step. */
  verifyLoginToken(token?: string | null): Observable<LoginStepResponse> {
    return this.http.call<LoginStepResponse>(API_ENDPOINTS.AUTH.VERIFY_LOGIN_TOKEN, {
      // The backend uses the cookie when present, otherwise this token (handed over in the return URL).
      body: token ? { token, client: this.client } : { client: this.client },
      flags: { skipAuth: true, skipErrorToast: true }
    });
  }

  /** Chooses the role to sign in with when the user holds several. */
  selectRole(roleId: number): Observable<LoginStepResponse> {
    return this.http.call<LoginStepResponse>(API_ENDPOINTS.AUTH.SELECT_ROLE, {
      body: { roleId, client: this.client },
      flags: { skipAuth: true, skipErrorToast: true }
    });
  }

  /** Sends the OTP of the pending second-factor challenge to the user's registered mobile. */
  sendOtp(): Observable<unknown> {
    return this.http.call(API_ENDPOINTS.AUTH.TWO_STEP_SEND_OTP, {
      body: {},
      flags: { skipAuth: true, skipErrorToast: true }
    });
  }

  /** Verifies the OTP or PIN; on success the backend sets the session cookies. */
  verifyTwoStep(method: TwoStepMethod, code: string): Observable<LoginStepResponse> {
    return this.http.call<LoginStepResponse>(API_ENDPOINTS.AUTH.TWO_STEP_VERIFY, {
      body: { method, code, client: this.client },
      flags: { skipAuth: true, skipErrorToast: true }
    });
  }

  /** Sets or changes the signed-in user's security PIN (used for PIN sign-in). */
  setPin(pin: string): Observable<{ success?: boolean; message?: string }> {
    return this.http.call(API_ENDPOINTS.AUTH.TWO_STEP_SET_PIN, {
      body: { pin },
      flags: { skipErrorToast: true }
    });
  }

  // ---- Session ------------------------------------------------------------------------------

  /** `refresh()`, shared: requests failing with 401 at the same time wait for one refresh call. */
  refreshOnce(): Observable<void> {
    this.refreshInFlight$ ??= this.refresh().pipe(
      finalize(() => (this.refreshInFlight$ = null)),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.refreshInFlight$;
  }

  /**
   * Asks the backend for a new access token (the refresh token travels as an HttpOnly cookie).
   * A token in the body, when there is one, replaces the stored bearer token.
   */
  refresh(): Observable<void> {
    return this.http
      .call<TokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        body: { client: this.client },
        flags: { skipAuth: true, skipErrorToast: true, skipLoading: true }
      })
      .pipe(
        map(res => {
          const token = extractAccessToken(res);
          if (token) this.tokens.setAccessToken(token);
        })
      );
  }

  /** The signed-in user with roles and permissions, or a 401 when there is no session. */
  session(): Observable<CurrentUserResponse> {
    return this.http.call<CurrentUserResponse>(API_ENDPOINTS.AUTH.SESSION, { flags: { skipErrorToast: true } });
  }

  /** Extends the RajSSO session; call every few minutes while the user is active. */
  keepAlive(): Observable<unknown> {
    return this.http.call(API_ENDPOINTS.AUTH.KEEP_ALIVE, {
      body: {},
      flags: { skipErrorToast: true, skipLoading: true }
    });
  }

  /** Ends the server session and clears its cookies. `redirectUrl` completes the sign-out at RajSSO. */
  logout(): Observable<LogoutResponse> {
    return this.http.call<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT, {
      body: {},
      flags: { skipAuth: true, skipErrorToast: true }
    });
  }
}
