import { IsString, IsDate, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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
