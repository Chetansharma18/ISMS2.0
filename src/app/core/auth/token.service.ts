import { Injectable, inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

const ACCESS_TOKEN_KEY = 'isms_token';

/**
 * Holds the bearer access token when the backend returns one in a response body.
 *
 * Web sessions normally ride on HttpOnly cookies that JavaScript cannot read; in that case this service stays
 * empty and the API interceptor only sends cookies (`withCredentials`). It is the single place the token is
 * read or written, so moving it (memory only, session storage) is a one-file change.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly storage = inject(StorageService);

  getAccessToken(): string | null {
    const token = this.storage.getString(ACCESS_TOKEN_KEY);
    return token && token !== 'null' && token !== 'undefined' ? token : null;
  }

  setAccessToken(token: string | null | undefined): void {
    if (token) {
      this.storage.setString(ACCESS_TOKEN_KEY, token);
    } else {
      this.clear();
    }
  }

  clear(): void {
    this.storage.removeItem(ACCESS_TOKEN_KEY);
  }
}
