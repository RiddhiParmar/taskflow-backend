export function validateEnv(config: Record<string, unknown>) {
  if (!config.PORT) {
    throw new Error('PORT is required');
  }
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL for db connection url required');
  }

  if (!config.PUBLIC_KEY) {
    throw new Error(`Env variable PUBLIC_KEY is required'`);
  }

  if (!config.PRIVATE_KEY) {
    throw new Error(`Env variable PRIVATE_KEY is required'`);
  }

  return config;
}
