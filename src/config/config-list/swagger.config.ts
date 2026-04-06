import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES } from '../config.tokens';

export default registerAs(ENV_NAMESPACES.SWAGGER, () => {
  return {
    endpoint: 'api/docs',
    title: 'Taskflow API Documentation',
    description: 'Taskflow API',
    version: '1.0',
    customOptions: {
      customSiteTitle: 'Taskflow Doc',
    },
  };
});
