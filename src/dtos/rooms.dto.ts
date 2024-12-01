import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { RoomType } from '@interfaces/rooms.interface';

export class CreateRoomDto {
  @IsString()
  public roomNumber: string;

  @IsEnum(RoomType)
  public type: RoomType;

  @IsNumber()
  public price: number;

  @IsBoolean()
  @IsOptional()
  public isAvailable?: boolean = true;

  @IsString()
  @IsOptional()
  public description?: string;
}

export class UpdateRoomDto extends CreateRoomDto {
  @IsOptional()
  public roomNumber: string;

  @IsOptional()
  public type: RoomType;

  @IsOptional()
  public price: number;
}

export class RoomAvailabilityDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
