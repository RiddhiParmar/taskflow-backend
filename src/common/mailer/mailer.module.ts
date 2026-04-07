import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerTemplateService } from './mailerTemplate.service';

@Module({
  imports: [],
  providers: [MailerTemplateService, MailerService],
  exports: [MailerTemplateService, MailerService],
})
export class MailerModule {}
