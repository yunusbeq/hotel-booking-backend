import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../interfaces/users.interface';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(32)
  public password: string;

  @IsEnum(UserRole)
  @IsOptional()
  public role?: UserRole = UserRole.CUSTOMER;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;
}
