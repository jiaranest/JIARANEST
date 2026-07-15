import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService, AuthUser, OtpResult } from './auth.service';
import { HttpAuthService } from './http-auth.service';
import { MockAuthService } from './mock-auth.service';
import { withFallback } from '../data/fallback.util';

/**
 * Auth that prefers the real API but falls back to the mock stub when the API
 * errors/times out. Login is stateful, so we track which impl actually signed
 * the user in and mirror ITS user into our own signal.
 *
 * `verifyOtp`/`loginWithGoogle` try the API; on failure they fall back to the
 * mock (which accepts any code). After each attempt we sync `user` from whichever
 * backing now reports a user.
 */
@Injectable({ providedIn: 'root' })
export class FallbackAuthService extends AuthService {
  private readonly api = inject(HttpAuthService);
  private readonly mock = inject(MockAuthService);

  private readonly _user = signal<AuthUser | null>(this.api.user() ?? this.mock.user());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  requestOtp(phone: string): Observable<OtpResult> {
    return withFallback(() => this.api.requestOtp(phone), () => this.mock.requestOtp(phone));
  }

  verifyOtp(phone: string, code: string): Observable<OtpResult> {
    return withFallback(
      () => this.api.verifyOtp(phone, code),
      () => this.mock.verifyOtp(phone, code),
    ).pipe(tap(() => this.sync()));
  }

  loginWithGoogle(): Observable<OtpResult> {
    return withFallback(
      () => this.api.loginWithGoogle(),
      () => this.mock.loginWithGoogle(),
    ).pipe(tap(() => this.sync()));
  }

  logout(): void {
    this.api.logout();
    this.mock.logout();
    this._user.set(null);
  }

  /** Reflect whichever backing actually holds a logged-in user. */
  private sync(): void {
    this._user.set(this.api.user() ?? this.mock.user());
  }
}
