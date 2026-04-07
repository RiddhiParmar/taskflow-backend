import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES } from '../config.tokens';

export default registerAs(ENV_NAMESPACES.MAILER, () => {
  return {
    noReplySender: process.env.MAIL_SENDER_NO_REPLY || 'onboarding@resend.dev',
    key: process.env.RESEND_KEY,
  };
});
