import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../enum/task.enum';
import { Types } from 'mongoose';

export class taskPaginationDto {
  limit!: number;
  page!: number;
}

export class GetPaginatedTaskParamDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit!: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsIn(['priority', 'dueDate'])
  sortBy?: 'priority' | 'dueDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class TaskUserNameDto {
  name!: string;
}

export class PaginatedTaskItemDto {
  _id!: string | Types.ObjectId;
  title!: string;
  description!: string;
  status!: TaskStatus;
  priority!: TaskPriority;
  assignedTo?: string | Types.ObjectId;
  dueDate!: Date;
  createdBy!: string | Types.ObjectId;
  isArchived!: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  assignedToUser?: TaskUserNameDto;
  createdByUser?: TaskUserNameDto;
}

export class GetPaginatedTaskResponseDto {
  data!: PaginatedTaskItemDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
