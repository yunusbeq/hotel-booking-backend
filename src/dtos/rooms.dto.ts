import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { RoomType } from '@interfaces/rooms.interface';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  public roomNumber: string;

  @IsEnum(RoomType)
  public type: RoomType;

  @IsNumber()
  public price: number;

  @IsBoolean()
  public isAvailable: boolean;

  @IsString()
  @IsOptional()
  public description?: string;
}

export class UpdateRoomDto extends CreateRoomDto {}

export class RoomAvailabilityDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
