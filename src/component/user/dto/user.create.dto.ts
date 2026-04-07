import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { toLowerCase } from '../../../common/transformer/transformer';

export class CreateUserDto {
  @IsNotEmpty({
    message: 'First name must be defined',
  })
  @IsString()
  firstName!: string;

  @IsNotEmpty({
    message: 'last Name must be defined',
  })
  @IsString()
  lastName!: string;

  @IsNotEmpty({
    message: 'Email must be defined',
  })
  @IsEmail()
  @Transform(({ value }) => toLowerCase(value))
  email!:string;

  @IsNotEmpty({
    message: 'Role not assigned',
  })

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
  @IsString()
  password!:string;

}

export class CreateUserResponseDto {
  userId!: string | Types.ObjectId;
}

export class LoginDto {
  @IsNotEmpty({
    message: 'Password must not be empty',
  })
  @IsString()
  password!: string;

  @Transform(({ value }) => toLowerCase(value))
  @IsEmail()
  email!: string;
}

