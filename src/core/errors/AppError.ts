export const APP_ERROR_CODES = [
  'unknown',
  'network',
  'timeout',
  'cancelled',
  'server',
  'unauthorized',
  'forbidden',
  'not_found',
  'validation',
  'conflict',
  'storage',
  'not_configured',
  'unsupported',
  'ai_unavailable',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export const DEFAULT_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  unknown: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
  network: 'Không kết nối được mạng. Kiểm tra kết nối rồi thử lại.',
  timeout: 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',
  cancelled: 'Yêu cầu đã bị huỷ.',
  server: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
  unauthorized: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  not_found: 'Không tìm thấy dữ liệu.',
  validation: 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.',
  conflict: 'Dữ liệu này đã tồn tại.',
  storage: 'Không đọc được dữ liệu trên máy. Vui lòng thử lại.',
  not_configured: 'Tính năng này chưa được cấu hình.',
  unsupported: 'Thiết bị không hỗ trợ tính năng này.',
  ai_unavailable: 'Trợ lý AI tạm thời không khả dụng.',
};

const RETRYABLE_CODES: ReadonlySet<AppErrorCode> = new Set<AppErrorCode>([
  'network',
  'timeout',
  'server',
  'storage',
  'ai_unavailable',
]);

export type AppErrorOptions = {
  cause?: unknown;
  retryable?: boolean;
  debugMessage?: string;
  details?: Readonly<Record<string, unknown>>;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly retryable: boolean;
  readonly debugMessage?: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(code: AppErrorCode, message?: string, options: AppErrorOptions = {}) {
    super(message?.trim() || DEFAULT_ERROR_MESSAGES[code], { cause: options.cause });

    this.name = 'AppError';
    this.code = code;
    this.retryable = options.retryable ?? RETRYABLE_CODES.has(code);
    this.debugMessage = options.debugMessage;
    this.details = options.details;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

export function appError(code: AppErrorCode, message?: string, options?: AppErrorOptions): AppError {
  return new AppError(code, message, options);
}

export function userMessageOf(error: unknown): string {
  if (isAppError(error)) return error.message;
  return DEFAULT_ERROR_MESSAGES.unknown;
}

export function describeError(error: unknown): string {
  if (isAppError(error)) {
    const parts = [`AppError(${error.code})`, error.message];
    if (error.debugMessage) parts.push(`debug="${error.debugMessage}"`);
    const cause = error.cause;
    if (cause instanceof Error) parts.push(`cause="${cause.name}: ${cause.message}"`);
    else if (cause !== undefined) parts.push(`cause=${String(cause)}`);
    return parts.join(' | ');
  }
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function isRetryable(error: unknown): boolean {
  return isAppError(error) ? error.retryable : false;
}
