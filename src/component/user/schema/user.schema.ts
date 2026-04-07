import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enum/user.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.USER,
    type: String,
  })
  role!: UserRole;

  @Prop({ select: false })
  tokens?: string[];

  @Prop({ select: false, default: null })
  forgetToken?: string;

  @Prop({ default: false })
  isArchived!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
