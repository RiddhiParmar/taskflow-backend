import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES, NODE_ENV } from '../config.tokens';
import * as process from 'process';

const redact = [
  'req.headers.authorization',
  'req.query.token',
];

const PinoLevelToSeverityLookup = {
  default: 'DEFAULT',
  silly: 'DEFAULT',
  verbose: 'DEBUG',
  debug: 'DEBUG',
  http: 'notice',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

const serializers = {
  req: (req) => {
    if (req.query?.token) {
      req.url = req.url.replace(/\?token=[^&]+/g, '?token=[Redacted]');
    }
    return req;
  },
};

const formatters = {
  level(label) {
    return {
      severity:
        PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup['warn'],
    };
  },
};

const LOGGER_CONFIGS = {
  quietReqLogger: true, // turn off the default logging output
  level: 'debug',
  transport: {
    target: 'pino-pretty', // use the pino-http-print transport and its
    // formatting output
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
    },
  },
};

const DEVELOPMENT_LOGGER_CONFIGS = { level: 'debug', formatters: formatters };

const PRODUCTION_LOGGER_CONFIGS = {
  level: 'warn',
  formatters: formatters,
  redact,
  serializers,
};

export default registerAs(ENV_NAMESPACES.LOGGER, () => {
  if (process.env.NODE_ENV === NODE_ENV.PRODUCTION){
    return {
      pinoHttp: PRODUCTION_LOGGER_CONFIGS,
    };
  }
  if (process.env.NODE_ENV === NODE_ENV.DEVELOPMENT) {
    return {
      pinoHttp: DEVELOPMENT_LOGGER_CONFIGS,
    };
  }
  return {
    pinoHttp: LOGGER_CONFIGS,
  };
});
