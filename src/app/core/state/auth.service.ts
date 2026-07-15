import { Observable } from 'rxjs';
import { Signal } from '@angular/core';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  method: 'otp' | 'google';
}

export interface OtpResult {
  ok: boolean;
  message?: string;
}

/**
 * The auth seam — mirrors the CatalogService pattern. `app.config` binds this
 * token to `MockAuthService` (Phase-1 stub) or `HttpAuthService` (real API,
 * Phase 2b) based on `environment.dataMode`.
 *
 * `user` / `isLoggedIn` are synchronous signals (so header/checkout/login-gate
 * read them without change). The action methods are async (they hit the network
 * in the real impl) and return Observables.
 *
 * There is NO login wall on browsing — the storefront gates login only at
 * "Proceed to Checkout" / "Buy Now" via LoginGateService.
 */
export abstract class AuthService {
  abstract readonly user: Signal<AuthUser | null>;
  abstract readonly isLoggedIn: Signal<boolean>;

  /** Ask the server to email an OTP to this address. */
  abstract requestOtp(email: string): Observable<OtpResult>;

  /** Verify an OTP code; on success the user is signed in. */
  abstract verifyOtp(email: string, code: string): Observable<OtpResult>;

  /** One-click Google login (still a stub until Google SSO is wired). */
  abstract loginWithGoogle(): Observable<OtpResult>;

  abstract logout(): void;
}
