import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Request an OTP for an email (sent via Resend, or logged to console in dev). */
  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.email);
  }

  /** Verify the OTP; returns { token, user } on success. */
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.email, dto.code);
  }

  /** Current user for a valid bearer token. */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { userId: string }) {
    return this.auth.me(req.userId);
  }
}
