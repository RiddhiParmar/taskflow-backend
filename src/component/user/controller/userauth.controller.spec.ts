import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthController } from './userauth.controller';
import { UserService } from '../user.service';
import { CreateUserDto, LoginDto } from '../dto/user.create.dto';
import { ForgetPasswordDto } from '../dto/user.update.dto';

describe('UserAuthController', () => {
  let controller: UserAuthController;
  let userService: jest.Mocked<UserService>;

  const userServiceMock = {
    createUser: jest.fn(),
    signInUser: jest.fn(),
    forgetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAuthController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserAuthController>(UserAuthController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return userId', async () => {
      const payload: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Pass@1234',
      };
      const response = { userId: '67f36f18ff2f2cbf9dca0003' };
      userService.createUser.mockResolvedValue(response);

      const result = await controller.createUser(payload);

      expect(userService.createUser).toHaveBeenCalledWith(payload);
      expect(result).toEqual(response);
    });
  });

  describe('signIn', () => {
    it('should login and return access token', async () => {
      const payload: LoginDto = {
        email: 'john@example.com',
        password: 'Pass@1234',
      };
      const response = {
        accessToken: 'mock-jwt-token',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const,
      };
      userService.signInUser.mockResolvedValue(response);

      const result = await controller.signIn(payload);

      expect(userService.signInUser).toHaveBeenCalledWith(payload);
      expect(result).toEqual(response);
    });
  });

  describe('forgetPassword', () => {
    it('should request reset token and return success message', async () => {
      const payload: ForgetPasswordDto = {
        email: 'john@example.com',
      };
      userService.forgetPassword.mockResolvedValue(undefined);

      const result = await controller.forgetPassword(payload);

      expect(userService.forgetPassword).toHaveBeenCalledWith(payload.email);
      expect(result).toEqual({
        message: 'Reset password mail sent successfully',
      });
    });
  });
});
