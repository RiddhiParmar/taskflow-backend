import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user.service';
import { AllPossibleResponses } from '../../../common/swagger/swagger';
import { RoutePath } from '../../../config';
import { ILoginResponse } from '../interfaces/user.interface';
import {
  CreateUserDto,
  CreateUserResponseDto,
  LoginDto,
} from '../dto/user.create.dto';
import { ForgetPasswordDto } from '../dto/user.update.dto';
import { SuccessMessageDto } from '../../../common/dto/common.dto';

@ApiTags('User-Auth')
@AllPossibleResponses()
@Controller(RoutePath.USER_AUTH)
export class UserAuthController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create new user
   * @param {UserDocument} body
   * @returns {CreateUserResponseDto} User _id
   */
  @Post()
  @ApiOperation({ summary: 'Create new user ' })
  async createUser(
    @Body() body: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return await this.userService.createUser(body);
  }

  /**
   * Login user
   * @param {LoginDto} loginData
   * @returns {Promise<ILoginResponse>} User data with user access token
   */
  @Post('login')
  @ApiOperation({ summary: 'login user ' })
  async signIn(@Body() loginData: LoginDto): Promise<ILoginResponse> {
    return await this.userService.signInUser(loginData);
  }

  /**
   * Send mail with new reset password token
   * @param {ForgetPasswordDto}forgetData
   * @returns Promise<SuccessMessageDto>
   */
  @Post('/forget-password-token')
  @ApiOperation({ summary: 'Request Token for forget password reset' })
  async forgetPassword(
    @Body() forgetData: ForgetPasswordDto,
  ): Promise<SuccessMessageDto> {
    await this.userService.forgetPassword(forgetData.email);
    return { message: 'Reset password mail sent successfully' };
  }
}
