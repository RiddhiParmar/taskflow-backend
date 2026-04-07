import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PIPE_ERROR_CONST, PIPE_ERROR_MESSAGE } from './pipes.errors';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform<
  string,
  Types.ObjectId
> {
  transform(value: string): Types.ObjectId {
    const isValidObjectId = Types.ObjectId.isValid(value);
    if (!isValidObjectId) {
      throw new BadRequestException({
        code: PIPE_ERROR_CONST.INVALID_OBJECT_ID,
        message: PIPE_ERROR_MESSAGE.INVALID_OBJECT_ID,
      });
    }
    return Types.ObjectId.createFromHexString(value) as Types.ObjectId;
  }
}
