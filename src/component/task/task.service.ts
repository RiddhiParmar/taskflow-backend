import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTaskDBDto,
  CreateTaskDto,
  CreateTaskResponseDto,
} from './dto/task.create.dto';
import { TaskRepository } from './task.repository';
import { TaskDocument } from './schema/task.schema';
import { Types } from 'mongoose';
import { type ConfigType } from '@nestjs/config';
import {
  GetPaginatedTaskParamDto,
} from './dto/task.get.dto';
import serverConfig from '../../config/config-list/server.config';
import { TASK_ERROR_CONST, TASK_ERROR_MESSAGE } from './task.errors';
import { User, UserDocument } from '../user/schema/user.schema';
import { UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.update.dto';
import { TaskStatus } from './enum/task.enum';

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
  async updateTask(taskId: string, taskData: UpdateTaskStatusDto): Promise<void> {
    if (
      [TaskStatus.COMPLETED].includes(taskData.status)
    ) {
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
  async assigneTask(taskId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    const updatedTask: TaskDocument | null =
      await this.taskRepository.findOneAndUpdate(
        { _id: taskId },
        { $set: {assignedTo: userId} },
      );
    if (!updatedTask) {
      throw new NotFoundException({
        code: TASK_ERROR_CONST.TASK_NOT_FOUND,
        message: TASK_ERROR_MESSAGE.TASK_NOT_FOUND,
      });
    }
    this.logger.log({ data: { taskId } }, 'Task Updated Successfully ');
  }

  // /**
  //  * Return the paginated  for task
  //  * @param {TaskStatus} status
  //  * @param {LeanDocument<UserDocument>} user
  //  * @param {GetPaginatedTaskParamDto} filterOptions
  //  */
  // async getPaginatedTask(
  //   status: TaskStatus,
  //   user: LeanDocument<UserDocument>,
  //   filterOptions: GetPaginatedTaskParamDto,
  // ) {
  //   await this.validateAssociation(user);
  //   const query: Record<string, any> = {
  //     userId: user._id,
  //     status,
  //     isArchived: false,
  //   };
  //   if (status === TaskStatus.COMPLETED) {
  //     query.status = { $in: [TaskStatus.COMPLETED, TaskStatus.TO_PROCESS] };
  //   }

  //   if (filterOptions.type) {
  //     query.type = filterOptions.type;
  //   }
  //   const promiseArray = [];
  //   promiseArray.push(
  //     this.taskRepository.paginateTask(query, {
  //       limit: filterOptions.limit,
  //       page: filterOptions.page,
  //       sort: {
  //         updatedAt: 'desc',
  //       },
  //       select: {
  //         eSign: 1,
  //         checkList: 1,
  //         status: 1,
  //         completedAt: 1,
  //         type: 1,
  //         firmId: 1,
  //       },
  //     }),
  //   );
  //   promiseArray.push(
  //     this.firmSettingsRepository.findOne(
  //       {
  //         firmId: user.firmId,
  //       },
  //       {
  //         taskSettings: 1,
  //         firmId: 1,
  //       },
  //     ),
  //   );

  //   const [taskData, firmSettings] = await Promise.all(promiseArray);
  //   const paginatedData = JSON.parse(JSON.stringify(taskData));
  //   paginatedData.docs = paginatedData.docs.map((task: KamigoSettings) => {
  //     if (!firmSettings.taskSettings[task.type][user.language]) {
  //       user.language = Language.ENGLISH;
  //     }
  //     const taskSettings = firmSettings.taskSettings[task.type];
  //     if (!taskSettings || !taskSettings[user.language]) {
  //       throw new Error(
  //         `Task settings not found for task type '${task.type}' and language '${user.language}'`,
  //       );
  //     }
  //     task.kamigoSettings = firmSettings.taskSettings[task.type][user.language];
  //     return task;
  //   });
  //   return paginatedData;
  // }c

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
