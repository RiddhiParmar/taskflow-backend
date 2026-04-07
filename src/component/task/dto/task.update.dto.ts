import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './task.create.dto';
import { TaskStatus } from '../enum/task.enum';
import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['assignedTo'] as const),
) {}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;
}

export class AssignTaskDto {
  @IsOptional()
  @IsMongoId()
  assignedTo?: string | Types.ObjectId;
}
