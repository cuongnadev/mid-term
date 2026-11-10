import { Platform } from 'react-native';
import { AppError, toAppError } from '@/core/errors';

type PostJsonOptions = {
  timeoutMs?: number;
  headers?: Record<string, string>;
};

type RawHttpResponse = {
  status: number;
  text: string;
};

function readApiErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  if ('error' in payload && payload.error && typeof payload.error === 'object') {
    const errObj = payload.error as Record<string, unknown>;
    if (typeof errObj.message === 'string' && errObj.message.trim()) {
      return errObj.message.trim();
    }
  }
  return undefined;
}

function statusToAppError(status: number, debugMessage?: string): AppError {
  const lower = (debugMessage ?? '').toLowerCase();

  if (status === 400 && (lower.includes('api key') || lower.includes('api_key'))) {
    return new AppError(
      'unauthorized',
      'Gemini API Key không hợp lệ (400). Kiểm tra lại EXPO_PUBLIC_GEMINI_API_KEY trong .env.local.',
      { debugMessage },
    );
  }
  if (status === 400) {
    return new AppError('validation', `Yêu cầu AI không hợp lệ (400): ${debugMessage ?? ''}`.trim(), {
      debugMessage,
    });
  }
  if (status === 401 || status === 403) {
    return new AppError(
      'unauthorized',
      `API Key chưa hợp lệ hoặc bị chặn quyền (${status}).`,
      { debugMessage },
    );
  }
  if (status === 404) {
    return new AppError('not_found', 'Không tìm thấy model AI (404).', { debugMessage });
  }
  if (status === 429) {
    return new AppError(
      'ai_unavailable',
      'Gemini API tạm thời vượt giới hạn miễn phí (429).',
      { retryable: true, debugMessage },
    );
  }
  if (status >= 500) {
    return new AppError('server', `Máy chủ Gemini đang bận (${status}).`, { debugMessage });
  }
  return new AppError('ai_unavailable', `Lỗi kết nối AI (HTTP ${status}).`, { debugMessage });
}

async function postJsonViaFetch(
  url: string,
  body: unknown,
  timeoutMs: number,
  headers: Record<string, string>,
): Promise<RawHttpResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    return { status: response.status, text };
  } catch (error: unknown) {
    if (timedOut || (error instanceof Error && error.name === 'AbortError')) {
      throw new AppError(
        'timeout',
        `Gemini API phản hồi quá ${Math.round(timeoutMs / 1000)} giây.`,
        { cause: error },
      );
    }
    throw toAppError(error, 'network');
  } finally {
    clearTimeout(timer);
  }
}

function postJsonViaXhr(
  url: string,
  body: unknown,
  timeoutMs: number,
  headers: Record<string, string>,
): Promise<RawHttpResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = timeoutMs;
    xhr.setRequestHeader('Content-Type', 'application/json');

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.onload = () => {
      resolve({ status: xhr.status, text: xhr.responseText ?? '' });
    };

    xhr.onerror = () => {
      reject(
        new AppError(
          'network',
          'Không kết nối được tới máy chủ AI. Kiểm tra kết nối Internet trên thiết bị.',
        ),
      );
    };

    xhr.ontimeout = () => {
      reject(
        new AppError(
          'timeout',
          `Gemini API phản hồi quá ${Math.round(timeoutMs / 1000)} giây.`,
        ),
      );
    };

    xhr.onabort = () => {
      reject(new AppError('cancelled', 'Yêu cầu tới Gemini API đã bị huỷ.'));
    };

    xhr.send(JSON.stringify(body));
  });
}

export async function postJson<TResponse>(
  url: string,
  body: unknown,
  options: PostJsonOptions = {},
): Promise<TResponse> {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const headers = options.headers ?? {};

  const { status, text } =
    Platform.OS === 'web'
      ? await postJsonViaFetch(url, body, timeoutMs, headers)
      : await postJsonViaXhr(url, body, timeoutMs, headers);

  let parsed: unknown = null;
  if (text.trim()) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (status < 200 || status >= 300) {
    throw statusToAppError(status, readApiErrorMessage(parsed) ?? `HTTP ${status}`);
  }

  return parsed as TResponse;
}