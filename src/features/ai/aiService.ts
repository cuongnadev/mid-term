import { postJson } from '@/core/api/httpClient';
import {
  GEMINI_API_KEY,
  GEMINI_FALLBACK_MODEL,
  GEMINI_MODEL,
  GEMINI_SECONDARY_FALLBACK_MODEL,
  GEMINI_TIMEOUT_MS,
  hasGeminiApiKey,
  isAdminEmail,
} from '@/core/config/appConfig';
import { AppError, describeError, toAppError } from '@/core/errors';
import {
  fold,
  generateCryptoStrongPassword,
  matchesQuery,
} from '@/core/utils';
import type { ProductAiSuggestion, ProductRecord } from '@/features/products/types';
import type { UserRecord } from '@/features/users/types';

export type AiSource = 'gemini' | 'local';

export type AdminAiResult = {
  answer: string;
  matchedIds: string[] | null;
  source: AiSource;
  note?: string;
};

export type PasswordSuggestionResult = {
  password: string;
  tip: string;
  source: AiSource;
};

export type ProductInventoryAiResult = {
  summary: string;
  lowStockInsights: string[];
  pricingInsights: string[];
  answer: string;
  source: AiSource;
};

type GeminiPart = {
  text?: string;
  thought?: boolean;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
};

function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractGeminiText(response: GeminiResponse): string {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const answerPart =
    parts.find((part) => part.thought !== true && typeof part.text === 'string' && part.text.trim()) ??
    parts.find((part) => typeof part.text === 'string' && part.text.trim());

  return typeof answerPart?.text === 'string' ? stripCodeFences(answerPart.text) : '';
}

async function requestModelJson(
  model: string,
  prompt: string,
  responseSchema: Record<string, unknown>,
): Promise<unknown> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.3,
    responseMimeType: 'application/json',
    responseSchema,
  };

  const response = await postJson<GeminiResponse>(
    endpoint,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    },
    {
      timeoutMs: GEMINI_TIMEOUT_MS,
      headers: { 'x-goog-api-key': GEMINI_API_KEY },
    },
  );

  const rawText = extractGeminiText(response);
  if (!rawText) {
    throw new AppError('server', 'Phản hồi từ Gemini không có nội dung văn bản.');
  }

  try {
    return JSON.parse(rawText);
  } catch (parseError) {
    throw new AppError('server', 'Không đọc được cấu trúc JSON từ Gemini.', { cause: parseError });
  }
}

async function executeGeminiWithFallback(
  prompt: string,
  responseSchema: Record<string, unknown>,
): Promise<unknown> {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_SECONDARY_FALLBACK_MODEL];
  let lastError: AppError | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i]!;
    try {
      if (i > 0) await delayMs(400);
      return await requestModelJson(model, prompt, responseSchema);
    } catch (err) {
      lastError = toAppError(err, 'ai_unavailable');
      console.warn(`[Gemini ${model}]`, describeError(lastError));
      if (lastError.code === 'network') {
        throw lastError;
      }
    }
  }

  throw lastError ?? new AppError('ai_unavailable', 'Không thể kết nối dịch vụ Gemini.');
}

function answerLocally(users: readonly UserRecord[], query: string): AdminAiResult {
  const q = fold(query);
  const total = users.length;
  const adminCount = users.filter((u) => isAdminEmail(u.email)).length;
  const withAvatar = users.filter((u) => u.hinhanh.trim().length > 0).length;

  if (q.includes('tong') || q.includes('bao nhieu') || q.includes('so luong')) {
    return {
      answer: `Hệ thống hiện có tổng cộng ${total} tài khoản (trong đó có ${adminCount} quản trị viên và ${withAvatar} tài khoản đã cập nhật ảnh đại diện).`,
      matchedIds: null,
      source: 'local',
      note: 'Xử lý cục bộ',
    };
  }

  const matches = users.filter((u) => matchesQuery(`${u.hoten} ${u.email}`, query));
  return {
    answer: matches.length > 0 ? `Tìm thấy ${matches.length} tài khoản phù hợp.` : 'Không tìm thấy tài khoản phù hợp.',
    matchedIds: matches.map((u) => u.id),
    source: 'local',
    note: 'Xử lý cục bộ',
  };
}

export async function askAdminAiAssistant(
  question: string,
  users: readonly UserRecord[],
): Promise<AdminAiResult> {
  if (!hasGeminiApiKey()) {
    return answerLocally(users, question);
  }

  const prompt = `Bạn là Trợ lý Quản trị viên người dùng.
Danh sách người dùng:
${users.slice(0, 30).map((u) => `- ${u.hoten} (${u.email})`).join('\n')}
Câu hỏi: "${question}"`;

  const schema = {
    type: 'OBJECT',
    properties: {
      answer: { type: 'STRING' },
      matchedEmails: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['answer'],
  };

  try {
    const raw = (await executeGeminiWithFallback(prompt, schema)) as any;
    const matchedEmails = Array.isArray(raw.matchedEmails) ? raw.matchedEmails : [];
    const matchedIds = users.filter((u) => matchedEmails.includes(u.email)).map((u) => u.id);
    return {
      answer: raw.answer || 'Đã xử lý yêu cầu.',
      matchedIds: matchedIds.length > 0 ? matchedIds : null,
      source: 'gemini',
    };
  } catch {
    return answerLocally(users, question);
  }
}

export async function suggestStrongPassword(): Promise<PasswordSuggestionResult> {
  const localPass = generateCryptoStrongPassword(16);
  if (!hasGeminiApiKey()) {
    return {
      password: localPass,
      tip: 'Mật khẩu 16 ký tự an toàn sinh bằng Crypto.',
      source: 'local',
    };
  }

  const prompt = `Hãy sinh 1 mật khẩu ngẫu nhiên độ bảo mật cực cao từ 14 đến 18 ký tự gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.`;
  const schema = {
    type: 'OBJECT',
    properties: {
      password: { type: 'STRING' },
      tip: { type: 'STRING' },
    },
    required: ['password', 'tip'],
  };

  try {
    const raw = (await executeGeminiWithFallback(prompt, schema)) as any;
    return {
      password: raw.password || localPass,
      tip: raw.tip || 'Mật khẩu sinh bởi Gemini AI.',
      source: 'gemini',
    };
  } catch {
    return {
      password: localPass,
      tip: 'Mật khẩu ngẫu nhiên cục bộ an toàn.',
      source: 'local',
    };
  }
}

function generateLocalProductSuggestion(productName: string): ProductAiSuggestion {
  const lower = fold(productName);
  let price = 250000;
  let soluong = 20;

  if (/chuot|ban phim|tai nghe|loa|laptop|dien thoai|usb|ram|ssd/.test(lower)) {
    if (/chuot/.test(lower)) price = 450000;
    else if (/ban phim/.test(lower)) price = 1250000;
    else if (/tai nghe/.test(lower)) price = 850000;
    else price = 950000;
    soluong = 15;
  } else if (/ao|quan|giay|dep|balo/.test(lower)) {
    if (/ao/.test(lower)) price = 220000;
    else if (/giay/.test(lower)) price = 790000;
    else price = 320000;
    soluong = 30;
  }

  return {
    suggestedPrice: price,
    suggestedSoluong: soluong,
    description: `Sản phẩm '${productName.trim()}' chất lượng cao, bền đẹp, đáp ứng nhu cầu sử dụng thực tế.`,
    reasoning: `Giá ước tính ${price.toLocaleString('vi-VN')} đ theo phân khúc thị trường phổ thông.`,
    source: 'local',
  };
}

export async function suggestProductDetails(productName: string): Promise<ProductAiSuggestion> {
  const name = productName.trim();
  if (!name) {
    throw new AppError('validation', 'Vui lòng nhập tên sản phẩm.');
  }

  if (!hasGeminiApiKey()) {
    return generateLocalProductSuggestion(name);
  }

  const prompt = `Bạn là chuyên gia quản lý sản phẩm và bán lẻ.
Hãy phân tích tên sản phẩm: "${name}".
Yêu cầu:
1. suggestedPrice: Giá bán đề xuất tại Việt Nam (số nguyên VNĐ, ví dụ 450000).
2. suggestedSoluong: Số lượng nhập kho khởi tạo (số nguyên từ 10 đến 50).
3. description: Mô tả súc tích điểm nổi bật (2 câu).
4. reasoning: Lý do đề xuất mức giá này.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      suggestedPrice: { type: 'NUMBER' },
      suggestedSoluong: { type: 'NUMBER' },
      description: { type: 'STRING' },
      reasoning: { type: 'STRING' },
    },
    required: ['suggestedPrice', 'suggestedSoluong', 'description', 'reasoning'],
  };

  try {
    const raw = (await executeGeminiWithFallback(prompt, schema)) as any;
    return {
      suggestedPrice: Math.max(1000, Number(raw.suggestedPrice) || 200000),
      suggestedSoluong: Math.max(1, Math.floor(Number(raw.suggestedSoluong) || 20)),
      description: String(raw.description || '').trim(),
      reasoning: String(raw.reasoning || '').trim(),
      source: 'gemini',
    };
  } catch {
    return generateLocalProductSuggestion(name);
  }
}

export async function analyzeProductInventory(
  products: ProductRecord[],
  userQuery?: string,
): Promise<ProductInventoryAiResult> {
  const totalItems = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.soluong, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.soluong, 0);
  const lowStock = products.filter((p) => p.soluong <= 5);

  const localSummary = `Kho có ${totalItems} mặt hàng, tổng ${totalStock} sản phẩm, tổng giá trị tồn kho: ${totalValue.toLocaleString('vi-VN')} đ.`;
  const localLowStock = lowStock.map((p) => `${p.name} (còn ${p.soluong} sp)`);

  if (!hasGeminiApiKey() || products.length === 0) {
    return {
      summary: localSummary,
      lowStockInsights: localLowStock.slice(0, 3),
      pricingInsights: ['Tồn kho đang ở mức ổn định, tiếp tục theo dõi xuất nhập.'],
      answer: userQuery ? `Xử lý cục bộ cho câu hỏi: "${userQuery}".` : 'Đã phân tích xong kho hàng.',
      source: 'local',
    };
  }

  const snippet = products.slice(0, 25).map((p) => `- ${p.name}: ${p.price} đ, SL: ${p.soluong}`).join('\n');
  const prompt = `Phân tích kho hàng sản phẩm:
${snippet}
Câu hỏi: "${userQuery ?? 'Đánh giá tổng quan tồn kho và đề xuất kinh doanh.'}"`;

  const schema = {
    type: 'OBJECT',
    properties: {
      summary: { type: 'STRING' },
      lowStockInsights: { type: 'ARRAY', items: { type: 'STRING' } },
      pricingInsights: { type: 'ARRAY', items: { type: 'STRING' } },
      answer: { type: 'STRING' },
    },
    required: ['summary', 'lowStockInsights', 'pricingInsights', 'answer'],
  };

  try {
    const raw = (await executeGeminiWithFallback(prompt, schema)) as any;
    return {
      summary: String(raw.summary || localSummary),
      lowStockInsights: Array.isArray(raw.lowStockInsights) ? raw.lowStockInsights : localLowStock,
      pricingInsights: Array.isArray(raw.pricingInsights) ? raw.pricingInsights : [],
      answer: String(raw.answer || 'Đã phân tích xong.'),
      source: 'gemini',
    };
  } catch {
    return {
      summary: localSummary,
      lowStockInsights: localLowStock.slice(0, 3),
      pricingInsights: ['Tồn kho đang ở mức ổn định.'],
      answer: 'Phân tích hoàn tất bằng bộ quy tắc cục bộ.',
      source: 'local',
    };
  }
}