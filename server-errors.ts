import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { logger } from './server-logger';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND', details?: unknown) {
    super(message, 404, code, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 503, 'CONFIGURATION_ERROR', details);
  }
}

type AsyncRouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncRoute(handler: AsyncRouteHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new NotFoundError(`Rota não encontrada: ${request.method} ${request.originalUrl}`, 'ROUTE_NOT_FOUND'));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const normalizedError =
    error instanceof AppError
      ? error
      : new AppError('Erro interno inesperado.', 500, 'INTERNAL_ERROR');

  logger.error('request.failed', error, {
    method: request.method,
    path: request.originalUrl,
    statusCode: normalizedError.statusCode,
    code: normalizedError.code,
    details: normalizedError.details,
  });

  response.status(normalizedError.statusCode).json({
    error: normalizedError.message,
    code: normalizedError.code,
    details: normalizedError.details ?? null,
  });
};