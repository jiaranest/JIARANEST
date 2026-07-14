import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  method: 'otp' | 'google';
}

const KEY = 'zylo.auth.v1';

/**
 * Phase-1 auth stub. There is NO login wall on browsing — the storefront gates
 * login only at "Proceed to Checkout" / "Buy Now". OTP + Google flows are
 * simulated here; a real implementation will call the backend + SSO later.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  /** Pretend to send an OTP; always "sent" in the mock. */
  requestOtp(_phone: string): { ok: boolean } {
    return { ok: true };
  }

  /** Any 4–6 digit code is accepted in the mock. */
  verifyOtp(phone: string, code: string): { ok: boolean; message?: string } {
    if (!/^\d{4,6}$/.test(code)) {
      return { ok: false, message: 'Enter the 6-digit code we sent you.' };
    }
    this.setUser({ id: 'u-' + phone, name: 'Shopper', phone, method: 'otp' });
    return { ok: true };
  }

  loginWithGoogle(): { ok: boolean } {
    this.setUser({
      id: 'u-google',
      name: 'Google User',
      email: 'shopper@gmail.com',
      method: 'google',
    });
    return { ok: true };
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
