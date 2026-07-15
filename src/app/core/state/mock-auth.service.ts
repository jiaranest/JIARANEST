import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService, AuthUser, OtpResult } from './auth.service';

const KEY = 'jiara.auth.v1';

/**
 * Phase-1 auth stub, kept as an env-switchable fallback (dataMode 'mock' or
 * 'fallback'). OTP + Google flows are simulated; any 4–6 digit code is accepted.
 * Same async signature as HttpAuthService so components don't care which is bound.
 */
@Injectable({ providedIn: 'root' })
export class MockAuthService extends AuthService {
  private readonly _user = signal<AuthUser | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  requestOtp(_phone: string): Observable<OtpResult> {
    return of({ ok: true });
  }

  verifyOtp(phone: string, code: string): Observable<OtpResult> {
    if (!/^\d{4,6}$/.test(code)) {
      return of({ ok: false, message: 'Enter the 6-digit code we sent you.' });
    }
    this.setUser({ id: 'u-' + phone, name: 'Shopper', phone, method: 'otp' });
    return of({ ok: true });
  }

  loginWithGoogle(): Observable<OtpResult> {
    this.setUser({
      id: 'u-google',
      name: 'Google User',
      email: 'shopper@gmail.com',
      method: 'google',
    });
    return of({ ok: true });
  }

  logout(): void {
    this._user.set(null);
    this.persist();
  }

  private setUser(u: AuthUser): void {
    this._user.set(u);
    this.persist();
  }

  private persist(): void {
    try {
      const u = this._user();
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  private load(): AuthUser | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
