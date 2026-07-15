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
/** Dev backdoor: this code always verifies. Remove when a real SMS provider is wired. */
const DEV_CODE = '123456';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Generate a 6-digit code for the phone, store it (replacing any prior code),
   * and "send" it by logging to the server console. In dev, `123456` also works.
   */
  async requestOtp(phone: string): Promise<{ ok: true }> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.prisma.otpCode.upsert({
      where: { phone },
      create: { phone, code, expiresAt, attempts: 0 },
      update: { code, expiresAt, attempts: 0 },
    });
    // Dev "delivery" — the code shows in the terminal running the API.
    console.log(`[OTP] ${phone} -> ${code}  (dev code ${DEV_CODE} also works)`);
    return { ok: true };
  }

  /**
   * Verify the code, upsert the user, and issue a JWT. Throws 401 on any
   * failure (no code, expired, too many attempts, wrong code).
   */
  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: AuthUser }> {
    const isDev = code === DEV_CODE;

    if (!isDev) {
      const record = await this.prisma.otpCode.findUnique({ where: { phone } });
      if (!record) {
        throw new UnauthorizedException('No code requested for this number.');
      }
      if (record.attempts >= MAX_ATTEMPTS) {
        throw new UnauthorizedException('Too many attempts. Request a new code.');
      }
      if (record.expiresAt.getTime() < Date.now()) {
        throw new UnauthorizedException('Code expired. Request a new one.');
      }
      if (record.code !== code) {
        await this.prisma.otpCode.update({
          where: { phone },
          data: { attempts: { increment: 1 } },
        });
        throw new UnauthorizedException('Incorrect code.');
      }
    }

    // Success — clear the code and upsert the user.
    await this.prisma.otpCode.deleteMany({ where: { phone } });
    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone, name: 'Shopper', method: 'otp' },
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
