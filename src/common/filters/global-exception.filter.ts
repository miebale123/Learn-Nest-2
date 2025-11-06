import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface ExceptionResponse {
  message?: string | string[];
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
  [key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let errorType = 'InternalServerErrorException';
    let message: string | string[] = 'An unexpected error occurred';
    let fieldErrors: Record<string, string[]> | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorType = exception.constructor.name;
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object' && 'message' in res) {
        const obj = res as ExceptionResponse;
        message = obj.message ?? message;

        //  pick up Zod fieldErrors or other details
        if (obj.fieldErrors) fieldErrors = obj.fieldErrors;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // log for observability
    this.logger.error({
      err: exception,
      statusCode: status,
      path: request.url,
      method: request.method,
      errorType,
      message,
      timestamp: new Date().toISOString(),
    });

    // client-safe response
    const clientResponse: Record<string, any> = {
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: errorType,
      message,
    };

    if (fieldErrors) clientResponse['errors'] = fieldErrors;

    response.status(status).json(clientResponse);
  }
}
