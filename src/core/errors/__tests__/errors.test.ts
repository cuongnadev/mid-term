import {
  AppError,
  DEFAULT_ERROR_MESSAGES,
  describeError,
  isAppError,
  isRetryable,
  userMessageOf,
} from '../AppError';
import { httpStatusToCode, serverErrorMessage, toAppError } from '../errorMapper';

describe('AppError', () => {
  it('dùng message mặc định theo mã lỗi', () => {
    const error = new AppError('network');
    expect(error.message).toBe(DEFAULT_ERROR_MESSAGES.network);
    expect(isAppError(error)).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('message không bao giờ rỗng dù truyền chuỗi trắng', () => {
    expect(new AppError('storage', '   ').message).toBe(DEFAULT_ERROR_MESSAGES.storage);
  });

  it('retryable suy ra từ mã lỗi và có thể ghi đè', () => {
    expect(new AppError('network').retryable).toBe(true);
    expect(new AppError('validation').retryable).toBe(false);
    expect(new AppError('validation', 'Lỗi tạm thời', { retryable: true }).retryable).toBe(true);
  });

  it('giữ nguyên message tuỳ chỉnh', () => {
    const error = new AppError('validation', 'Tên sản phẩm không được để trống.');
    expect(error.message).toBe('Tên sản phẩm không được để trống.');
  });
});

describe('toAppError', () => {
  it('trả lại chính AppError đã có', () => {
    const original = new AppError('not_found');
    expect(toAppError(original)).toBe(original);
  });

  it('nhận diện lỗi mạng của fetch', () => {
    expect(toAppError(new TypeError('Network request failed')).code).toBe('network');
    expect(toAppError(new Error('Failed to fetch')).code).toBe('network');
  });

  it('nhận diện timeout', () => {
    expect(toAppError(new Error('Request timeout')).code).toBe('timeout');
  });

  it('nhận diện AbortError là cancelled', () => {
    const aborted = new Error('Aborted');
    aborted.name = 'AbortError';
    expect(toAppError(aborted).code).toBe('cancelled');
  });

  it('nhận diện lỗi SQLite là storage', () => {
    expect(toAppError(new Error('SQLITE_BUSY: database is locked')).code).toBe('storage');
    expect(toAppError(new Error('no such table: products')).code).toBe('storage');
  });

  it('không rò rỉ message kỹ thuật ra cho người dùng', () => {
    const mapped = toAppError(new Error('ECONNREFUSED 127.0.0.1:5432'));
    expect(mapped.code).toBe('unknown');
    expect(mapped.message).toBe(DEFAULT_ERROR_MESSAGES.unknown);
    expect(mapped.debugMessage).toContain('ECONNREFUSED');
    expect(userMessageOf(mapped)).toBe(DEFAULT_ERROR_MESSAGES.unknown);
  });

  it('dùng mã dự phòng khi được yêu cầu', () => {
    expect(toAppError(new Error('chuyện lạ'), 'storage').code).toBe('storage');
  });

  it('xử lý giá trị không phải Error', () => {
    expect(toAppError('chuỗi lỗi').code).toBe('unknown');
    expect(toAppError(undefined).code).toBe('unknown');
    expect(toAppError({ message: 'object có message' }).debugMessage).toBe('object có message');
  });
});

describe('httpStatusToCode', () => {
  it.each([
    { status: 400, code: 'validation' },
    { status: 401, code: 'unauthorized' },
    { status: 403, code: 'forbidden' },
    { status: 404, code: 'not_found' },
    { status: 409, code: 'conflict' },
    { status: 422, code: 'validation' },
    { status: 500, code: 'server' },
    { status: 503, code: 'server' },
    { status: 418, code: 'unknown' },
  ])('HTTP $status -> $code', ({ status, code }) => {
    expect(httpStatusToCode(status)).toBe(code);
  });
});

describe('serverErrorMessage', () => {
  it('đọc message theo quy ước { error: { message } }', () => {
    expect(serverErrorMessage({ error: { code: 'x', message: 'Không tìm thấy sản phẩm.' } })).toBe(
      'Không tìm thấy sản phẩm.',
    );
  });

  it('bỏ qua body sai shape', () => {
    expect(serverErrorMessage({ error: { code: 'x' } })).toBeUndefined();
    expect(serverErrorMessage({ error: { message: '   ' } })).toBeUndefined();
    expect(serverErrorMessage(null)).toBeUndefined();
    expect(serverErrorMessage('text')).toBeUndefined();
  });
});

describe('describeError', () => {
  it('gồm mã lỗi, message và cause', () => {
    const error = new AppError('storage', undefined, { cause: new Error('disk I/O error') });
    const text = describeError(error);
    expect(text).toContain('AppError(storage)');
    expect(text).toContain('disk I/O error');
  });

  it('xử lý giá trị không phải Error', () => {
    expect(describeError(42)).toBe('42');
  });
});

describe('isRetryable', () => {
  it('chỉ đúng với lỗi có thể thử lại', () => {
    expect(isRetryable(new AppError('network'))).toBe(true);
    expect(isRetryable(new AppError('not_found'))).toBe(false);
    expect(isRetryable(new Error('lạ'))).toBe(false);
  });
});
