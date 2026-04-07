import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User, UserDocument } from '../schema/user.schema';
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
import {
  CreateUserDto,
  CreateUserResponseDto,
  LoginDto,
} from '../dto/user.create.dto';
import {
  ForgetPasswordDto,
  ResetPasswordDto,
  SetUserPasswordDto,
  UpdateUserDto,
} from '../dto/user.update.dto';
import { type CustomRequest } from '../../../common/interface/custom.server.interface';
import { SuccessMessageDto } from '../../../common/dto/common.dto';
import { AdminGuard } from '../../../common/authentication/admin.guard';

@ApiTags('User')
@AllPossibleResponses()
@Controller(RoutePath.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Update user profile
   * @param {CustomRequest} req Authorized user
   * @param {UpdateUserDto} updateUserData
   * @returns {Promise<User>} Updated user data
   */
  @Patch()
  @ApiBearerAuth('JWT-auth')
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
  @ApiBearerAuth('JWT-auth')
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
  @ApiBearerAuth('JWT-auth')
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
  @ApiBearerAuth('JWT-auth')
  async getUser(@Req() req: CustomRequest): Promise<User> {
    const user = req.user;
    return await this.userService.getUserData(user!._id);
  }

  /**
   * Get all user data
   * @param { CustomRequest } req
   * @returns {Promise<User>}
   */
  @Get('/all')
  @UseGuards(AdminGuard) // Only admins can hit this endpoint
  @ApiOperation({ summary: 'Get all user data ' })
  @ApiBearerAuth('JWT-auth')
  async getAllUsers(): Promise<Array<UserDocument> | null> {
    return await this.userService.getAllUser();
  }

  /**
   * Reset the user password
   * @param {string} passwordResetToken
   * @param {SetUserPasswordDto} passwordData
   * @returns {Promise<SuccessMessageDto>}
   */
  @Post('/forget-reset-password')
  @ApiOperation({ summary: 'Reset forget password' })
  @ApiHeader({
    name: 'PasswordResetToken',
    description: 'Temporary reset password token.',
    required: true,
    schema: { type: 'string' },
  })
  async resetForgetPassword(
    @Headers('PasswordResetToken') passwordResetToken: string,
    @Body() passwordData: SetUserPasswordDto,
  ): Promise<SuccessMessageDto> {
    await this.userService.resetForgetPassword(
      passwordResetToken,
      passwordData,
    );
    return { message: 'User password reset successfully' };
  }
}
