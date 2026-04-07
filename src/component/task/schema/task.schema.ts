import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Document, SchemaTypes, Types } from 'mongoose';
import { TaskPriority, TaskStatus } from '../enum/task.enum';
import { DBCollectionNameTokens } from '../../../config';
import { User } from '../../user/schema/user.schema';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop({ default: 'todo', enum: TaskStatus })
  status!: TaskStatus;

  @Prop({ default: 'medium', enum: TaskPriority })
  priority!: TaskPriority;

  @Prop({
    type: SchemaTypes.ObjectId,
    refPath: [DBCollectionNameTokens.USER],
  })
  assignedTo?: Types.ObjectId;

  @Prop({ type: SchemaTypes.Date })
  dueDate!: Date;

  @Prop({ 
    type: SchemaTypes.ObjectId,
    refPath: [DBCollectionNameTokens.USER], })
  createdBy!: Types.ObjectId | User;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ type: SchemaTypes.Date })
  createdAt?: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority : 1 });
TaskSchema.index({title:'text', content: 'text'})
TaskSchema.plugin(mongoosePaginate);
