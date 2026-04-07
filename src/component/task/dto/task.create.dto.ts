import {
  IsEnum,
  IsMongoId,
  IsString,
  IsDate,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../enum/task.enum';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class createParamDto {
  @IsMongoId()
  userId!: string;
}

export class CreateTaskDto {
  @IsNotEmpty({
    message: 'Titile must be set',
  })
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @IsDate()
  @Type(() => Date)
  dueDate!: Date;

  @IsOptional()
  @IsMongoId()
  assignedTo?: Types.ObjectId;
}

export class CreateTaskDBDto extends CreateTaskDto {
  @IsMongoId()
  createdBy!: Types.ObjectId;
}

export class CreateTaskResponseDto {
  taskId!: string | Types.ObjectId;
}
