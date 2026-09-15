import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = isHttpException
      ? exception.getResponse()
      : { message: "Internal server error" };

    if (!isHttpException) {
      this.logger.error(exception);
    }

    const message =
      typeof body === "string" ? body : ((body as { message?: string | string[] }).message ?? "Unexpected error");

    response.status(statusCode).json({
      statusCode,
      message,
      error: isHttpException ? exception.name : "InternalServerError",
    });
  }
}
