import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AuthService, AuthUser, OtpResult } from './auth.service';
import { environment } from '../config/environment';

const TOKEN_KEY = 'jiara.auth.token.v1';
const USER_KEY = 'jiara.auth.v1';

interface VerifyResponse {
  token: string;
  user: AuthUser;
}

/**
 * Real auth — talks to the NestJS API (see server/src/auth). On verify it
 * stores the JWT + user in localStorage; the auth interceptor attaches the
 * token as a Bearer header. On construction it restores the session and
 * revalidates it against /auth/me (logging out if the token is stale).
 */
@Injectable({ providedIn: 'root' })
export class HttpAuthService extends AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private readonly _user = signal<AuthUser | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  /** The stored bearer token, or null. Read by the auth interceptor. */
  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  constructor() {
    super();
    // If we have a token, confirm it's still valid (and refresh the user).
    if (this.token) {
      this.http
        .get<AuthUser>(`${this.base}/auth/me`)
        .pipe(catchError(() => of(null)))
        .subscribe((u) => (u ? this.setUser(u) : this.clear()));
    }
  }

  requestOtp(phone: string): Observable<OtpResult> {
    return this.http.post<{ ok: boolean }>(`${this.base}/auth/otp/request`, { phone }).pipe(
      map(() => ({ ok: true }) as OtpResult),
      catchError((e) => of({ ok: false, message: this.errMsg(e, 'Could not send code.') })),
    );
  }

  verifyOtp(phone: string, code: string): Observable<OtpResult> {
    return this.http.post<VerifyResponse>(`${this.base}/auth/otp/verify`, { phone, code }).pipe(
      tap((res) => {
        this.storeToken(res.token);
        this.setUser(res.user);
      }),
      map(() => ({ ok: true }) as OtpResult),
      catchError((e) => of({ ok: false, message: this.errMsg(e, 'Incorrect or expired code.') })),
    );
  }

  loginWithGoogle(): Observable<OtpResult> {
    // Google SSO not wired yet (needs a Google Cloud OAuth client).
    return of({ ok: false, message: 'Google sign-in is coming soon.' });
  }

  logout(): void {
    this.clear();
  }

  // ---- helpers ----

  private setUser(u: AuthUser): void {
    this._user.set(u);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
  }

  private storeToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  }

  private clear(): void {
    this._user.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private errMsg(err: unknown, fallback: string): string {
    const e = err as { error?: { message?: string | string[] } };
    const m = e?.error?.message;
    if (Array.isArray(m)) return m[0] ?? fallback;
    return m ?? fallback;
  }
}
