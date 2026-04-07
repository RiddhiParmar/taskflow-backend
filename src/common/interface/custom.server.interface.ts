import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { User } from '../../component/user/schema/user.schema';

// 1. Unified Request Interface
// In Express, we don't need 'Auth' vs 'Custom' splits like Fastify's .raw
export interface CustomRequest extends Request {
  // Use LeanDocument if you are using .lean() in your auth service
  user?: Document & User;
}

// 2. Custom Response Interface
export interface CustomResponse extends Response {
  /**
   * Custom Response generator
   * @param statusCode
   * @param data
   */
  sendResponse(statusCode: number, data?: any): void;
}
