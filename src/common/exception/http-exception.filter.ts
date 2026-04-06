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
      `Error on ${req.method} ${req.url}`,
      originalError?.stack || exception.stack,
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