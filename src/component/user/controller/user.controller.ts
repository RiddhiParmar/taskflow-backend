import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { User } from '../schema/user.schema';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../user.service';
import { AllPossibleResponses } from '../../../common/swagger/swagger';
import { RoutePath } from '../../../config';
import { ILoginResponse } from '../interfaces/user.interface';
import { CreateUserDto, CreateUserResponseDto, LoginDto } from '../dto/user.create.dto';
import { ForgetPasswordDto, ResetPasswordDto, SetUserPasswordDto, UpdateUserDto } from '../dto/user.update.dto';
import { type CustomRequest } from '../../../common/interface/custom.server.interface';
import { SuccessMessageDto } from '../../../common/dto/common.dto';


@ApiTags('User')
@AllPossibleResponses()
@Controller(RoutePath.USER)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

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
  @Post('signIn')
  @ApiOperation({ summary: 'SignIn user ' })
  async signIn(@Body() loginData: LoginDto): Promise<ILoginResponse> {
    return await this.userService.signInUser(loginData);
  }

  /**
   * Update user profile
   * @param {CustomRequest} req Authorized user
   * @param {UpdateUserDto} updateUserData
   * @returns {Promise<User>} Updated user data
   */
  @Patch()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a user profile ' })
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() updateUserData: UpdateUserDto,
  ): Promise<User> {
    const user = req.user;
    return await this.userService.updateUser(user, updateUserData);
  }

  /**
   * Logout the user
   * @param {Request} req
   * @returns Promise<SuccessMessageDto>
   */
  @Post('/logout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout the user' })
  async logOut(@Req() req: CustomRequest): Promise<SuccessMessageDto> {
    const user = req.user;
    await this.userService.logoutUser(user!._id, req.headers.authorization!);
    return { message: 'User logout successfully' };
  }

  /**
   * Reset the user password
   * @param { CustomRequest } req
   * @param {ResetPasswordDto} resetPasswordData
   * @returns Promise<SuccessMessageDto>
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password  when user know the old one' })
  @ApiBearerAuth('access-token')
  async resetPassword(
    @Req() req: CustomRequest,
    @Body() resetPasswordData: ResetPasswordDto,
  ): Promise<SuccessMessageDto> {
    const user = req.user;
    await this.userService.resetPassword(user!._id, resetPasswordData);
    return { message: 'User password updated successfully' };
  }

  /**
   * Get user data
   * @param { CustomRequest } req
   * @returns {Promise<User>}
   */
  @Get()
  @ApiOperation({ summary: 'Get user data ' })
  @ApiBearerAuth('access-token')
  async getUser(@Req() req: CustomRequest): Promise<User> {
    const user = req.user;
    return await this.userService.getUserData(user!._id);
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

  /**
   * Reset the user password
   * @param {string} passwordResetToken
   * @param {SetUserPasswordDto} passwordData
   * @returns {Promise<SuccessMessageDto>}
   */
  @Post('/forget-reset-password')
  @ApiOperation({ summary: 'Reset forget password' })
  @ApiBearerAuth('')
  async resetForgetPassword(
    @Headers('Authorization') passwordResetToken: string,
    @Body() passwordData: SetUserPasswordDto,
  ): Promise<SuccessMessageDto> {
    await this.userService.resetForgetPassword(
      passwordResetToken,
      passwordData,
    );
    return { message: 'User password reset successfully' };
  }

}
