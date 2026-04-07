import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schema/task.schema';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { UserModule } from '../user/user.module';
import { TaskRepository } from './task.repository';
import { AuthenticationMiddleware } from '../../common/authentication/authentication.middleware';
import { JwtAuthModule } from '../../common/jwt/jwt.module';
import { MailerModule } from '../../common/mailer/mailer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    JwtAuthModule,
    MailerModule,
    UserModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskRepository],
})
export class TaskModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthenticationMiddleware).forRoutes(TaskController);
  }
}
