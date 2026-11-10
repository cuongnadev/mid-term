import { AppError, isAppError, type AppErrorCode } from './AppError';

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const value = (error as { message?: unknown }).message;
    return typeof value === 'string' ? value : '';
  }
  return '';
}

function nameOf(error: unknown): string {
  return error instanceof Error ? error.name : '';
}

const SQLITE_HINTS = ['sqlite', 'database is locked', 'database disk image is malformed', 'no such table'];

const NETWORK_HINTS = ['network request failed', 'failed to fetch', 'fetch failed', 'network error'];

const TIMEOUT_HINTS = ['timeout', 'timed out', 'etimedout'];

export function toAppError(error: unknown, fallbackCode: AppErrorCode = 'unknown'): AppError {
  if (isAppError(error)) return error;

  const name = nameOf(error);
  const message = messageOf(error);
  const lower = message.toLowerCase();

  if (name === 'AbortError' || lower.includes('aborted')) {
    return new AppError('cancelled', undefined, { cause: error, debugMessage: message });
  }

  if (name === 'TimeoutError' || TIMEOUT_HINTS.some((hint) => lower.includes(hint))) {
    return new AppError('timeout', undefined, { cause: error, debugMessage: message });
  }

  if (NETWORK_HINTS.some((hint) => lower.includes(hint))) {
    return new AppError('network', undefined, { cause: error, debugMessage: message });
  }

  if (SQLITE_HINTS.some((hint) => lower.includes(hint))) {
    return new AppError('storage', undefined, { cause: error, debugMessage: message });
  }

  return new AppError(fallbackCode, undefined, {
    cause: error,
    debugMessage: message || undefined,
  });
}

export function httpStatusToCode(status: number): AppErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

type ServerErrorBody = { error?: { code?: unknown; message?: unknown } };

export function serverErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const { error } = body as ServerErrorBody;
  if (!error || typeof error !== 'object') return undefined;
  return typeof error.message === 'string' && error.message.trim() ? error.message : undefined;
}
