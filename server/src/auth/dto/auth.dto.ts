import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^\d{10}$/, { message: 'phone must be a 10-digit number' })
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\d{10}$/, { message: 'phone must be a 10-digit number' })
  phone!: string;

  @IsString()
  @Matches(/^\d{4,6}$/, { message: 'code must be a 4-6 digit number' })
  code!: string;
}
