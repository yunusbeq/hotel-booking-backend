import { IsString, IsDate, IsNumber, IsEnum } from 'class-validator';
import { BookingStatus } from '@interfaces/bookings.interface';

export class CreateBookingDto {
  @IsString()
  public roomId: string;

  @IsDate()
  public startDate: Date;

  @IsDate()
  public endDate: Date;

  @IsNumber()
  public totalPrice: number;

  @IsEnum(BookingStatus)
  public status: BookingStatus = BookingStatus.PENDING;
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  public status: BookingStatus;
}
