import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PaginateModel, type PipelineStage } from 'mongoose';
import { SchemaRepository } from '../../common/database/schema.repository';
import { Task, TaskDocument } from './schema/task.schema';
import { DATABASE_ERROR_CODES } from '../../common/database/database.errors';

@Injectable()
export class TaskRepository extends SchemaRepository<TaskDocument> {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Task.name)
    private readonly paginateTaskModel: PaginateModel<TaskDocument>,
  ) {
    super(taskModel);
  }

  async paginateTask(entityFilterQuery, paginationOption) {
    try {
      return await this.paginateTaskModel.paginate(
        entityFilterQuery,
        paginationOption,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        {
          code: 'GET_DATA',
          message: DATABASE_ERROR_CODES.GET_DATA,
        },
        { cause: err },
      );
    }
  }

  async taskCount(entityFilterQuery) {
    try {
      return await this.taskModel.countDocuments(entityFilterQuery);
    } catch (err) {
      throw new InternalServerErrorException(
        {
          code: 'GET_DATA',
          message: DATABASE_ERROR_CODES.GET_DATA,
        },
        { cause: err },
      );
    }
  }

  async aggregateTask(pipeline: PipelineStage[]) {
    try {
      return await this.taskModel.aggregate(pipeline);
    } catch (err) {
      throw new InternalServerErrorException(
        {
          code: 'GET_DATA',
          message: DATABASE_ERROR_CODES.GET_DATA,
        },
        { cause: err },
      );
    }
  }
}
