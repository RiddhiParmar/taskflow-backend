import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './user.create.dto';
import { Match } from '../../../common/decorators/match.decorator';
import { Transform } from 'class-transformer';
import { toLowerCase } from '../../../common/transformer/transformer';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

export class PartialUpdateUserDto extends PartialType(CreateUserDto) {
  tokens?: Array<string>;
}

export class ResetPasswordDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  @MinLength(8, {
    message: 'password must be a 8 characters log',
  })
  @MaxLength(128, {
    message: 'password not be 128 characters long',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password should be a combination of uppercase, lowercase, number and special character',
  })
  newPassword!: string;

  @Match('newPassword', {
    message: 'Password and confirm password not matched',
  })
  confirmPassword!: string;
}

export class SetUserPasswordDto {
  @IsString()
  @MinLength(8, {
    message: 'password must be a 8 characters log',
  })
  @MaxLength(128, {
    message: 'password not be 128 characters long',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password should be a combination of uppercase, lowercase, number and special character',
  })
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password should be a combination of uppercase, lowercase, number and special character',
  })
  @Match('password', {
    message: 'Password and confirm password not matched',
  })
  confirmPassword!: string;
}

export class ForgetPasswordDto {
  @Transform(({ value }) => toLowerCase(value))
  @IsEmail()
  email!: string;
}

  

