import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

/** Shape returned to the client — matches the Angular `AuthUser` interface. */
export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  method: 'otp' | 'google';
}

const OTP_TTL_MS = 5 * 60 * 1000; // codes valid 5 minutes
const MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  // Email via Brevo's HTTP API (works on hosts that block SMTP ports, e.g.
  // Render). If BREVO_API_KEY is unset, sending is skipped and the code is
  // logged to the console (dev fallback).
  private readonly brevoKey = process.env.BREVO_API_KEY ?? '';
  private readonly fromEmail = process.env.MAIL_FROM_EMAIL ?? 'no-reply@jiaranest.app';
  private readonly fromName = process.env.MAIL_FROM_NAME ?? 'Jiaranest';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Generate a 6-digit code for the email, store it (replacing any prior code),
   * and email it via Brevo. If BREVO_API_KEY is unset (or sending fails), the
   * code is logged to the server console instead (dev fallback).
   */
  async requestOtp(email: string): Promise<{ ok: true }> {
    const addr = email.trim().toLowerCase();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.prisma.otpCode.upsert({
      where: { email: addr },
      create: { email: addr, code, expiresAt, attempts: 0 },
      update: { code, expiresAt, attempts: 0 },
    });
    await this.sendCode(addr, code);
    return { ok: true };
  }

  /**
   * Verify the code, upsert the user, and issue a JWT. Throws 401 on any
   * failure (no code, expired, too many attempts, wrong code).
   */
  async verifyOtp(email: string, code: string): Promise<{ token: string; user: AuthUser }> {
    const addr = email.trim().toLowerCase();

    const record = await this.prisma.otpCode.findUnique({ where: { email: addr } });
    if (!record) {
      throw new UnauthorizedException('No code requested for this email.');
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('Too many attempts. Request a new code.');
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Code expired. Request a new one.');
    }
    if (record.code !== code) {
      await this.prisma.otpCode.update({
        where: { email: addr },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Incorrect code.');
    }

    // Success — clear the code and upsert the user.
    await this.prisma.otpCode.deleteMany({ where: { email: addr } });
    const user = await this.prisma.user.upsert({
      where: { email: addr },
      create: { email: addr, name: 'Shopper', method: 'otp' },
      update: {},
    });

    return { token: this.sign(user.id), user: this.toAuthUser(user) };
  }

  /** Validate a user id (from a verified JWT) and return the current user. */
  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists.');
    return this.toAuthUser(user);
  }

  // ---- helpers ----

  /** Email the code via Brevo's HTTP API; fall back to a console log if unavailable. */
  private async sendCode(email: string, code: string): Promise<void> {
    if (!this.brevoKey) {
      console.log(`[OTP] ${email} -> ${code}  (no BREVO_API_KEY set; logging code)`);
      return;
    }
    // Abort after 10s so a slow mail call can never hang the request.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.brevoKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email }],
          subject: 'Your Jiaranest login code',
          htmlContent: `
            <div style="font-family:system-ui,sans-serif;max-width:420px;margin:auto">
              <h2 style="color:#6e7b4f">Jiaranest</h2>
              <p>Your login code is:</p>
              <p style="font-size:32px;font-weight:800;letter-spacing:6px;color:#3b3325">${code}</p>
              <p style="color:#6b6355;font-size:13px">This code expires in 5 minutes. If you didn't request it, ignore this email.</p>
            </div>`,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[OTP] Brevo send failed (${res.status}): ${body}`);
        console.log(`[OTP] ${email} -> ${code}`);
      }
    } catch (e) {
      // Never fail the login flow on a mail error — log the code so dev can proceed.
      console.error('[OTP] email send error, logging code instead:', e);
      console.log(`[OTP] ${email} -> ${code}`);
    } finally {
      clearTimeout(timer);
    }
  }

  private sign(userId: string): string {
    return this.jwt.sign({ sub: userId });
  }

  private toAuthUser(u: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    method: string;
  }): AuthUser {
    return {
      id: u.id,
      name: u.name,
      method: u.method as 'otp' | 'google',
      ...(u.phone ? { phone: u.phone } : {}),
      ...(u.email ? { email: u.email } : {}),
    };
  }
}
