import { MailerDto } from '../../mailer.dto';

export const sendMailStub = (): MailerDto => {
  return {
    to: 'test@example.com',
    subject: 'Sending with SendGrid ',
    html: '<strong> Maile Testing</strong>',
  };
};

export const sendStub = () => {
  return {
    from: 'no-reply@test.io',
    ...sendMailStub(),
  };
};
