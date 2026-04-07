import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateTaskDBDto,
  CreateTaskDto,
  CreateTaskResponseDto,
} from './dto/task.create.dto';
import { TaskRepository } from './task.repository';
import { TaskDocument } from './schema/task.schema';
import { Types } from 'mongoose';
import { type ConfigType } from '@nestjs/config';
import serverConfig from '../../config/config-list/server.config';
import { TASK_ERROR_CONST, TASK_ERROR_MESSAGE } from './task.errors';
import { AssignTaskDto, UpdateTaskStatusDto } from './dto/task.update.dto';
import { TaskStatus } from './enum/task.enum';
import {
  GetPaginatedTaskParamDto,
  GetPaginatedTaskResponseDto,
} from './dto/task.get.dto';
import { CustomRequest } from '../../common/interface/custom.server.interface';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @Inject(serverConfig.KEY)
    private readonly serverConfigurations: ConfigType<typeof serverConfig>,
    private readonly taskRepository: TaskRepository,
  ) {}

  /**
   * Create task
   * @param {User & Document} user
   * @param {CreateTaskDto} taskData
   * @returns {Promise<CreateUserResponseDto>} return task _id
   */
  async createTask(
    user,
    taskData: CreateTaskDto,
  ): Promise<CreateTaskResponseDto> {
    if (user.role !== 'admin' || !taskData.assignedTo) {
      taskData.assignedTo = user._id;
    }
    const newTaskData: CreateTaskDBDto = {
      createdBy: user._id,
      ...taskData,
    };
    const newTask: TaskDocument = await this.taskRepository.create(newTaskData);
    this.logger.log(
      {
        data: { userId: user._id, email: user?.email, taskId: newTask._id },
      },
      'Task Created Successfully ',
    );
    return { taskId: newTask._id };
  }

  /**
   * Update task
   * @param {string} taskId
   * @param {UpdateTaskDto} taskData
   */
  async updateTask(
    taskId: string,
    taskData: UpdateTaskStatusDto,
  ): Promise<void> {
    if ([TaskStatus.COMPLETED].includes(taskData.status)) {
      taskData.completedAt = new Date();
    }
    const updatedTask: TaskDocument | null =
      await this.taskRepository.findOneAndUpdate(
        { _id: taskId },
        { $set: taskData },
      );
    if (!updatedTask) {
      throw new NotFoundException({
        code: TASK_ERROR_CONST.TASK_NOT_FOUND,
        message: TASK_ERROR_MESSAGE.TASK_NOT_FOUND,
      });
    }
    this.logger.log({ data: { taskId } }, 'Task Updated Successfully ');
  }

  /**
   * Update task
   * @param {string} taskId
   * @param {UpdateTaskDto} taskData
   */
  async assigneTask(taskId: string, body: AssignTaskDto): Promise<void> {
    const updatedTask: TaskDocument | null =
      await this.taskRepository.findOneAndUpdate(
        { _id: taskId },
        { $set: { assignedTo: body.assignedTo } },
      );
    if (!updatedTask) {
      throw new NotFoundException({
        code: TASK_ERROR_CONST.TASK_NOT_FOUND,
        message: TASK_ERROR_MESSAGE.TASK_NOT_FOUND,
      });
    }
    this.logger.log({ data: { taskId } }, 'Task Updated Successfully ');
  }

  /**
   * Return the paginated  for task
   * @param {TaskStatus} status
   * @param {LeanDocument<UserDocument>} user
   * @param {GetPaginatedTaskParamDto} filterOptions
   */
  async getPaginatedTask(
    user: CustomRequest['user'],
    query: GetPaginatedTaskParamDto,
  ): Promise<GetPaginatedTaskResponseDto> {
    const filter: Record<string, any> = {};
    filter.isArchived = false;

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (user?.role === 'admin') {
      if(query.assignedTo) {
          filter.assignedTo = new Types.ObjectId(query.assignedTo);
      }
    } else {
      filter.assignedTo = new Types.ObjectId(user?._id);
    }

    // tasks created by the current user
    if (user?.role !== 'admin') {
      filter.createdBy = new Types.ObjectId(user?._id);
    }

    const sortField = query.sortBy || 'dueDate';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [result] = await this.taskRepository.aggregateTask([
      { $match: filter },
      {
        $facet: {
          data: [
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'assignedTo',
                foreignField: '_id',
                as: 'assignedToUser',
                pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdByUser',
                pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
              },
            },
            {
              $addFields: {
                assignedToUser: { $arrayElemAt: ['$assignedToUser', 0] },
                createdByUser: { $arrayElemAt: ['$createdByUser', 0] },
              },
            },
            {
              $addFields: {
                assignedToUser: {
                  name: {
                    $trim: {
                      input: {
                        $concat: [
                          { $ifNull: ['$assignedToUser.firstName', ''] },
                          ' ',
                          { $ifNull: ['$assignedToUser.lastName', ''] },
                        ],
                      },
                    },
                  },
                },
                createdByUser: {
                  name: {
                    $trim: {
                      input: {
                        $concat: [
                          { $ifNull: ['$createdByUser.firstName', ''] },
                          ' ',
                          { $ifNull: ['$createdByUser.lastName', ''] },
                        ],
                      },
                    },
                  },
                },
              },
            },
          ],
          metadata: [{ $count: 'total' }],
        },
      },
    ]);

    const data = result?.data || [];
    const total = result?.metadata?.[0]?.total || 0;
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Archived the tasks
   * @param taskId
   */
  async deleteTask(taskId: string | Types.ObjectId) {
    const task = await this.taskRepository.findOneAndUpdate(
      { _id: taskId },
      { $set: { isArchived: true } },
    );
    if (!task) {
      this.logger.error({ data: { taskId } }, 'Task not found');
      throw new NotFoundException({
        code: TASK_ERROR_CONST.TASK_NOT_FOUND,
        message: TASK_ERROR_MESSAGE.TASK_NOT_FOUND,
      });
    }
  }
}
