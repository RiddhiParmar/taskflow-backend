import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateTaskDto } from "./task.create.dto";
import { TaskStatus } from "../enum/task.enum";
import { IsDate, IsEnum } from "class-validator";

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['assignedTo'] as const),
) {}

export class UpdateTaskStatusDto  {
    @IsEnum(TaskStatus)
    status!: TaskStatus

    @IsDate()
    completedAt?: Date;
}
