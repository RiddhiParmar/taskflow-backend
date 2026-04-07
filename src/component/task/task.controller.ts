import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllPossibleResponses } from '../../common/swagger/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoutePath } from '../../config';
import { TaskService } from './task.service';
import { CreateTaskDto, CreateTaskResponseDto } from './dto/task.create.dto';
import {
  GetPaginatedTaskParamDto,
  GetPaginatedTaskResponseDto,
} from './dto/task.get.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/object-validation.pipe';
import { SuccessMessageDto } from '../../common/dto/common.dto';
import { type CustomRequest } from '../../common/interface/custom.server.interface';
import { AdminGuard } from '../../common/authentication/admin.guard';
import { AssignTaskDto, UpdateTaskStatusDto } from './dto/task.update.dto';

@ApiTags('Task')
@ApiBearerAuth('JWT-auth')
@AllPossibleResponses()
@Controller(RoutePath.TASK)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Create new task
   * @param { CustomRequest } req
   * @param {CreateTaskDto} body
   * @returns {Promise<CreateTaskResponseDto>}
   */
  @Post('')
  @ApiOperation({ summary: 'Create new task ' })
  @ApiBody({
    type: CreateTaskDto,
  })
  async createTask(
    @Req() req: CustomRequest,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<CreateTaskResponseDto> {
    const user = req.user;
    return await this.taskService.createTask(user, createTaskDto);
  }

  /**
   * Update task status
   * @param {string} taskId
   * @param {UpdateTaskStatusDto} body
   * @returns {Promise<SuccessMessageDto>}
   */
  @Patch(':taskId')
  @ApiOperation({ summary: 'Update task status' })
  async updateTask(
    @Param('taskId', ObjectIdValidationPipe) taskId: string,
    @Body() body: UpdateTaskStatusDto,
  ): Promise<SuccessMessageDto> {
    await this.taskService.updateTask(taskId, body);
    return { message: 'task updated successfully' };
  }

  /**
   * Get task paginated data
   * @param {CustomRequest} req
   * @param {GetPaginatedTaskParamDto} queryParam
   * @returns Promise<Array<Task>>
   */
  @Get('/')
  @ApiOperation({ summary: 'Get task data with pagination' })
  async getPaginatedTask(
    @Req() req: CustomRequest,
    @Query() queryParam: GetPaginatedTaskParamDto,
  ): Promise<GetPaginatedTaskResponseDto> {
    const user = req.user;
    return await this.taskService.getPaginatedTask(user, queryParam);
  }

  /**
   * delete task for user
   * @param taskId
   * @returns {Promise<SuccessMessageDto>}
   */
  @Delete('/:taskId')
  @ApiOperation({ summary: 'Delete task of customer' })
  async deleteTask(
    @Param('taskId', ObjectIdValidationPipe) taskId: string,
  ): Promise<SuccessMessageDto> {
    await this.taskService.deleteTask(taskId);
    return { message: 'Task deleted successfully ' };
  }

  /**
   * Assigne task to user
   * @param taskId
   * @returns {Promise<SuccessMessageDto>}
   */
  @Patch(':id/reassign')
  @UseGuards(AdminGuard) // Only admins can hit this endpoint
  reassign(
    @Param('id', ObjectIdValidationPipe) taskId: string,
    @Body() body: AssignTaskDto,
  ) {
    return this.taskService.assigneTask(taskId, body);
  }
}
