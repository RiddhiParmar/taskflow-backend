import { UserRole } from '../enum/user.enum';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string; // mongo date
  updatedAt: string; // mongo date
}

export interface ILoginResponse {
  accessToken: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}
