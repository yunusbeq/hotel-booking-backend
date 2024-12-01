import { IsString, IsDate, IsNumber, IsEnum, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '@interfaces/bookings.interface';

export class CreateBookingDto {
  @IsString()
  public roomId: string;

  @Type(() => Date)
  @IsDate()
  public startDate: Date;

  @Type(() => Date)
  @IsDate()
  public endDate: Date;

  @IsNumber()
  public totalPrice: number;

  @ValidateIf(o => o.startDate && o.endDate)
  @IsDate()
  validateDateRange() {
    return this.startDate < this.endDate;
  }
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  public status: BookingStatus;
}

export class CancelBookingDto {
  @IsString()
  public cancellationReason: string;
}
