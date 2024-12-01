import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { RoomType } from '@interfaces/rooms.interface';

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
