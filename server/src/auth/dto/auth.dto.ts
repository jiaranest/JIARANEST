import { IsEmail, IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsEmail({}, { message: 'a valid email is required' })
  email!: string;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'a valid email is required' })
  email!: string;

  @IsString()
  @Matches(/^\d{4,6}$/, { message: 'code must be a 4-6 digit number' })
  code!: string;
}
