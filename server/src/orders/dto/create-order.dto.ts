import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsString()
  slug!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  /** e.g. { Color: 'Black', Size: 'M' }. Passed through, not validated by key. */
  @IsOptional()
  selectedOptions?: Record<string, string>;
}

export class AddressDto {
  @IsString() name!: string;
  @IsString() @Matches(/^\d{10}$/) phone!: string;
  @IsString() line1!: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city!: string;
  @IsString() state!: string;
  @IsString() @Matches(/^\d{6}$/) pincode!: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsIn(['standard', 'express'])
  delivery!: 'standard' | 'express';

  @IsIn(['upi', 'card', 'netbanking', 'wallet', 'cod'])
  paymentMethod!: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

  /** Optional coupon code; server validates + applies it (never trusts a client total). */
  @IsOptional()
  @IsString()
  couponCode?: string;
}
