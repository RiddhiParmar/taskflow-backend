/** These are the namespaces registered for config/env variables (config service) */
export enum ENV_NAMESPACES {
  DATABASE = 'database',
  LOGGER = 'logger',
  SERVER = 'server',
  SWAGGER = 'swagger',
}


/** Use this for giving reference to the collection name in Schema */
// Values will be the name of collection from DB
export enum DBCollectionNameTokens {
  USER = 'users',
  TASK = 'tasks',
}

/** These are the names of the name of route base path */

export enum RoutePath {
  USER = 'user',
  TASK = 'task',
}

/** Node Environment */
export enum NODE_ENV {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}
