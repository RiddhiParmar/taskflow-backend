import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';


const ErrorMessage = 'Oops, something went wrong';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpException.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: ErrorMessage };

    // Extract original error if exists
    const originalError = exception?.cause;

    // Log the error with stack trace
    this.logger.error(
      {
        status,
        // Error code i.e. 'USER_NOT_FOUND'
        code: exception?.code,
        path: req.url,
        traceId: req.id,
        // extra fields
        meta: exception?.meta || exception?.response,
        // Error object if error was thrown
        err: exception.err || exception,
      },
      exception?.message,
    );

    //response to client
    res.status(status).json({
      success: false,
      message:
        typeof response === 'string'
          ? response
          : response['message'],
      code: response['code'] || HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
}