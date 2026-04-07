import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import mailerConfig from '../../../../../../../../office/riddhi-kamigo-backend/src/config/config-list/mailer.config';
import { MailerService } from '../mailer.service';
import { sendMailStub, sendStub } from './stub/mailer.stub';
import * as sendgridMail from '@sendgrid/mail';

describe('MailerService', () => {
  let mailerService: MailerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mailerConfig],
        }),
      ],
      providers: [MailerService],
    }).compile();
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(mailerService).toBeDefined();
  });

  describe('sendMail', () => {
    it('should send mail', async () => {
      //Spy the sendMultiple function
      jest.spyOn(sendgridMail, 'send').mockImplementationOnce(async () => {
        return [{} as any, {}];
      });

      //When mailer service call send mail with sendMailStub
      await mailerService.sendMail(sendMailStub());

      //Then it should call the sendgrid send method
      expect(sendgridMail.send).toHaveBeenCalledWith(sendStub());
    });
  });
});
