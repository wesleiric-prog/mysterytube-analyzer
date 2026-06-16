import type { Request, Response } from 'express';

type LogContext = Record<string, unknown>;
type LogLevel = 'info' | 'warn' | 'error';

function writeLog(level: LogLevel, message: string, context: LogContext = {}) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  });

  if (level === 'error') {
    console.error(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  console.log(payload);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: error };
}

export const logger = {
  info(message: string, context: LogContext = {}) {
    writeLog('info', message, context);
  },
  warn(message: string, context: LogContext = {}) {
    writeLog('warn', message, context);
  },
  error(message: string, error: unknown, context: LogContext = {}) {
    writeLog('error', message, {
      ...context,
      error: serializeError(error),
    });
  },
  request(request: Request, response: Response, durationMs: number) {
    writeLog(response.statusCode >= 500 ? 'error' : response.statusCode >= 400 ? 'warn' : 'info', 'request.completed', {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs,
    });
  },
};