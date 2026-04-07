import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { MailerDto } from './mailer.dto';
import { Resend } from 'resend';
import mailerConfig from '../../config/config-list/mailer.config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resend
  constructor(
    @Inject(mailerConfig.KEY)
    private readonly mailerConfigurations: ConfigType<typeof mailerConfig>,
  ) {
    this.resend = new Resend(this.mailerConfigurations.key);
  }

  public async sendMail(sendMessage: MailerDto) {
    this.logger.debug({ data: { email: sendMessage.to } }, 'Sending email');
    const mailBody = {
      from: this.mailerConfigurations.noReplySender,
      to: sendMessage.to,
      subject: sendMessage.subject,
      html: sendMessage.html,
    };
    return await this.resend.emails.send.send(mailBody);
  }
}