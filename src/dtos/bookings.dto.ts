import { IsString, IsDate, IsNumber, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '@interfaces/bookings.interface';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  public roomId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  public startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  public endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  public totalPrice: number;
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  public status: BookingStatus;
}

export class CancelBookingDto {
  @IsString()
  @IsNotEmpty()
  public cancellationReason: string;
}
