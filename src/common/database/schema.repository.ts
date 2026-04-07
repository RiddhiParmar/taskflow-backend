import { Document,Model, QueryFilter, UpdateQuery } from 'mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { DATABASE_ERROR_CODES } from './database.errors';

export abstract class SchemaRepository<T extends Document> {
  constructor(protected readonly schemaModel: Model<T>) {}

  async findOne(
    entityFilterQuery: QueryFilter<T>,
    projection?: Record<string, unknown>,
  ): Promise<T| null> {
    try {
      return await this.schemaModel
        .findOne({ isArchived: false, ...entityFilterQuery }, projection)
        .lean();
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'GET_DATA',
        message: DATABASE_ERROR_CODES.GET_DATA,
      }, {cause: err});
    }
  }

  async find(entityFilterQuery: QueryFilter<T>): Promise<T[] | null> {
    try {
      return await this.schemaModel.find(entityFilterQuery);
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'GET_DATA',
        message: DATABASE_ERROR_CODES.GET_DATA,
      }, {cause: err});
    }
  }

  async create(createEntityData: Partial<T>): Promise<T> {
    try {
      return await this.schemaModel.create(createEntityData);
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'CREATE_RESOURCE',
        message: DATABASE_ERROR_CODES.CREATE_DATA,
      }, {cause: err});
    }
  }

  async findOneAndUpdate(
    entityFilterQuery: QueryFilter<T>,
    updateEntityData: UpdateQuery<unknown>,
    options: Record<string, any> = {
      new: true,
    },
  ): Promise<T | null> {
    try {
      return await this.schemaModel
        .findOneAndUpdate(
          { isArchived: false, ...entityFilterQuery },
          updateEntityData,
          options,
        )
        .lean();
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'UPDATE_RESOURCE',
        message: DATABASE_ERROR_CODES.UPDATE_DATA,
      }, {cause: err});
    }
  }

  async updateMany(
    entityFilterQuery: QueryFilter<T>,
    updateEntityData: UpdateQuery<unknown>,
  ) {
    try {
      return await this.schemaModel.updateMany(
        entityFilterQuery,
        updateEntityData,
      );
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'UPDATE_RESOURCE',
        message: DATABASE_ERROR_CODES.UPDATE_DATA,
      }, {cause: err});
    }
  }


  async findOneAndDelete(entityFilterQuery: QueryFilter<T>): Promise<T| null> {
    try {
      return await this.schemaModel.findOneAndDelete(entityFilterQuery);
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'DELETE_RESOURCE',
        message: DATABASE_ERROR_CODES.DELETE_DATA,
      }, {cause: err});
    }
  }

  async deleteMany(entityFilterQuery: QueryFilter<T>): Promise<void> {
    try {
      await this.schemaModel.deleteMany(entityFilterQuery);
    } catch (err) {
      throw new InternalServerErrorException({
        code: 'DELETE_RESOURCE',
        message: DATABASE_ERROR_CODES.DELETE_DATA,
      },
       {cause: err});
    }
  }
}
