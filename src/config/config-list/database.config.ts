import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES } from '../config.tokens';

export default registerAs(ENV_NAMESPACES.DATABASE, () => {
  return {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow',
  };
});
