import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtAuthService } from '../../common/jwt/jwt.services';
import {
  ResetPasswordDto,
  SetUserPasswordDto,
  UpdateUserDto,
} from './dto/user.update.dto';
import { UserRepository } from './user.repository';
import { User, UserDocument } from './schema/user.schema';
import { Document, Types } from 'mongoose';
import { type ConfigType } from '@nestjs/config';
import serverConfig from '../../config/config-list/server.config';
import { ILoginResponse } from './interfaces/user.interface';
import { MailerService } from '../../common/mailer/mailer.service';
import { USER_ERROR_CONST, USER_ERROR_MESSAGE } from './user.errors';
import { MailerTemplateService } from '../../common/mailer/mailerTemplate.service';
import {
  CreateUserDto,
  CreateUserResponseDto,
  LoginDto,
} from './dto/user.create.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger();

  constructor(
    @Inject(serverConfig.KEY)
    private readonly serverConfigurations: ConfigType<typeof serverConfig>,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtAuthService,
    private readonly mailerService: MailerService,
    private readonly mailerTemplateService: MailerTemplateService,
  ) {}

  /**
   * Find a user and if not found throw the exception
   * @param query
   * @param projection
   * @returns
   */
  async getUser(
    query: Record<string, any>,
    projection?: Record<string, any>,
  ): Promise<UserDocument> {
    const user: UserDocument | null = await this.userRepository.findOne(
      query,
      projection,
    );
    if (!user) {
      this.logger.error({ data: { query } }, 'User not found with this query');
      throw new NotFoundException({
        code: USER_ERROR_CONST.USER_NOT_FOUND,
        message: USER_ERROR_MESSAGE.USER_NOT_FOUND,
      });
    }
    this.logger.log({ data: { userId: user?._id } }, 'User get successfully');
    return user;
  }

  /**
   * Create the new user
   * @param {CreateUserDto} userData
   * @returns {Promise<CreateUserResponseDto>} return user _id
   */
  async createUser(userData: CreateUserDto): Promise<CreateUserResponseDto> {
    const newUser: CreateUserDto = userData;

    const newPasswordHash = await bcrypt.hash(newUser.password, 10);
    newUser.password = newPasswordHash;

    const user = await this.userRepository.create(newUser).catch((err) => {
      if (err?.cause?.code === 11000) {
        throw new BadRequestException(
          {
            code: USER_ERROR_CONST.EMAIL_ALREADY_EXIST,
            message: USER_ERROR_MESSAGE.EMAIL_ALREADY_EXIST,
          },
          { cause: err },
        );
      }
      throw err;
    });
    this.logger.log(
      { data: { userId: user._id, email: newUser.email } },
      'User created successfully',
    );
    const userName = user.firstName[0].toUpperCase() + user.firstName.slice(1);
    const mailContent =
      await this.mailerTemplateService.welcomeMailTemplate(userName);
    this.mailerService.sendMail({
      to: user.email,
      subject: mailContent.subject,
      html: mailContent.html,
    });
    return { userId: user._id };
  }

  /**
   * Generate session token for login
   * @param {string} userId
   * @returns {Promise<ILoginResponse>}
   */
  async generateSessionToken(userId: Types.ObjectId): Promise<ILoginResponse> {
    const accessToken: string = this.jwtService.createToken(
      {
        _id: userId,
      },
      this.serverConfigurations.jwtAuthentication.signOptions,
    );
    const updatedUserData: User | null =
      await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { $push: { tokens: accessToken } },
      );
    return { accessToken, ...updatedUserData };
  }

  /**
   * Validate email and password and generate new sign in token if valid
   * @param {LoginDto} userData
   * @returns Promise<ILoginResponse>
   */
  async signInUser(userData: LoginDto): Promise<ILoginResponse> {
    const user = await this.getUser({ email: userData.email }, { password: 1 });

    const isMatch = await bcrypt.compare(userData.password, user.password);

    if (!isMatch) {
      this.logger.error(
        { data: { userId: user._id, email: userData.email } },
        "Password doesn't match",
      );
      throw new UnauthorizedException({
        code: USER_ERROR_CONST.INVALID_PASSWORD,
        message: USER_ERROR_MESSAGE.INVALID_PASSWORD,
      });
    }

    this.logger.log(
      { data: { userId: user._id, email: userData.email } },
      'User sign in successfully',
    );
    return this.generateSessionToken(user._id);
  }

  /**
   * Update user fields for profile
   * @param {LeanDocument<UserDocument>} user
   * @param {User} userUpdates
   * @returns Promise<User>
   */
  async updateUser(user, userUpdates: UpdateUserDto): Promise<User> {
    const query: Record<string, any> = userUpdates;

    const userData = await this.userRepository.findOneAndUpdate(
      { _id: user._id },
      { $set: query },
    );
    if (!userData) {
      this.logger.error(
        { data: { id: user._id } },
        'User not found with this query',
      );
      throw new NotFoundException({
        code: USER_ERROR_CONST.USER_NOT_FOUND,
        message: USER_ERROR_MESSAGE.USER_NOT_FOUND,
      });
    }

    this.logger.log(
      { data: { userId: user._id, email: userData?.email } },
      'User updated successfully',
    );
    return userData;
  }

  /**
   * Logout user
   * @param {string| Types.ObjectId} userId
   * @param {string} token
   * @returns Promise<void>
   */
  async logoutUser(
    userId: string | Types.ObjectId,
    token: string,
  ): Promise<void> {
    const userToken = token.replace('Bearer ', '');
    const user = await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { $pull: { tokens: userToken } },
    );
    this.logger.log(
      { data: { userId, email: user?.email } },
      'User logout successfully',
    );
  }

  /**
   * Reset user password
   * @param {string | Types.ObjectId } userId
   * @param  {ResetPasswordDto} resetPasswordData
   * @returns {Promise<void>}
   */
  async resetPassword(
    userId: string | Types.ObjectId,
    resetPasswordData: ResetPasswordDto,
  ): Promise<void> {
    const user = await this.getUser({ _id: userId }, { password: 1, email: 1 });
    const isOldPasswordMatch = await bcrypt.compare(
      resetPasswordData.oldPassword,
      user.password,
    );
    if (!isOldPasswordMatch) {
      this.logger.error(
        { data: { userId, email: user.email } },
        'Old password not match',
      );
      throw new BadRequestException({
        code: USER_ERROR_CONST.OLD_PASSWORD_NOT_MATCH,
        message: USER_ERROR_MESSAGE.OLD_PASSWORD_NOT_MATCH,
      });
    }
    const isNewPasswordSameAsOld = await bcrypt.compare(
      resetPasswordData.newPassword,
      user.password,
    );
    if (isNewPasswordSameAsOld) {
      this.logger.error(
        { data: { userId, email: user.email } },
        'New password match with old',
      );
      throw new BadRequestException({
        code: USER_ERROR_CONST.NEW_PASSWORD_MATCH_WITH_OLD,
        message: USER_ERROR_MESSAGE.NEW_PASSWORD_MATCH_WITH_OLD,
      });
    }
    const newPasswordHash = await bcrypt.hash(
      resetPasswordData.newPassword,
      10,
    );

    await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { $set: { password: newPasswordHash } },
    );
    this.logger.log(
      { data: { userId, email: user.email } },
      'Password reset successfully',
    );
  }

  /**
   * Return the user Data
   * @param {string| Types.ObjectId} userId
   * @returns {Promise<User>}
   */
  async getUserData(userId: string | Types.ObjectId): Promise<User> {
    return this.getUser({ _id: userId });
  }

  /**
   * Return the user Data
   * @param {string| Types.ObjectId} userId
   * @returns {Promise<User>}
   */
  async getAllUser(): Promise<Array<UserDocument> | null> {
    return this.userRepository.find({ isArchived: false });
  }
  /**
   * Generate token for reset password and send the mail
   * @param {string} email
   * @returns{Promise<void>}
   */
  async forgetPassword(email: string): Promise<void> {
    const user = await this.getUser({ email });

    const accessToken: string = this.jwtService.createToken(
      {
        id: user._id,
      },
      this.serverConfigurations.jwtAuthentication.signOptionsForForgetPassword,
    );
    const mailContent = await this.mailerTemplateService.forgetMailTemplate({
      resetPasswordUrl: `${this.serverConfigurations.frontendBaseUrl}/reset-password?token=${accessToken}`,
    });
    await Promise.all([
      this.userRepository.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            forgetToken: accessToken,
          },
        },
      ),
      this.mailerService.sendMail({
        to: user.email,
        subject: mailContent.subject,
        html: mailContent.html,
      }),
    ]);
    this.logger.log(
      { data: { userId: user._id, email } },
      'User on-boarding incomplete',
    );
  }

  /**
   * Reset forget password
   * @param {string} resetPasswordToken
   * @param {SetUserPasswordDto} passwordData
   * @returns{Promise<void>}
   */
  async resetForgetPassword(
    resetPasswordToken: string,
    passwordData: SetUserPasswordDto,
  ): Promise<void> {
    console.log('resetPasswordToken', resetPasswordToken);
    let decode;
    try {
      decode = await this.jwtService.verifyToken(resetPasswordToken);
    } catch (err) {
      this.logger.error(
        { err },
        'Error arrived while jwt token decode for reset password',
      );
      throw new BadRequestException({
        code: USER_ERROR_CONST.RESET_PASSWORD_TOKEN_EXPIRED,
        message: USER_ERROR_MESSAGE.RESET_PASSWORD_TOKEN_EXPIRED,
        err,
      });
    }
    if (!decode.id) {
      this.logger.error('Invalid token, Id is missing in token');
      throw new BadRequestException({
        code: USER_ERROR_CONST.INVALID_TOKEN,
        message: USER_ERROR_MESSAGE.INVALID_TOKEN,
      });
    }
    const newPasswordHash = await bcrypt.hash(passwordData.password, 10);
    const userData = await this.userRepository.findOneAndUpdate(
      { _id: decode.id },
      {
        $set: {
          password: newPasswordHash,
          forgetToken: null,
        },
      },
    );
    if (!userData) {
      this.logger.error(
        { data: { userId: decode._id } },
        'User data not found with this id',
      );
      throw new NotFoundException({
        code: USER_ERROR_CONST.USER_NOT_FOUND,
        message: USER_ERROR_MESSAGE.USER_NOT_FOUND,
      });
    }
    this.logger.log(
      { data: { userId: decode._id, email: userData.email } },
      'Forget password reset successfully',
    );
  }
}
