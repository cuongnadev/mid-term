import { createTheme, type ColorSchemeName, type ThemeColors } from './tokens';

export const AA_NORMAL_TEXT = 4.5;
export const AA_LARGE_TEXT = 3;

type Rgb = { r: number; g: number; b: number };

export function parseHexColor(hex: string): Rgb | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const digits = match[1];
  if (!digits) return null;

  return {
    r: Number.parseInt(digits.slice(0, 2), 16),
    g: Number.parseInt(digits.slice(2, 4), 16),
    b: Number.parseInt(digits.slice(4, 6), 16),
  };
}

function channelLuminance(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) throw new Error(`Màu không hợp lệ: ${hex}`);

  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);

  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);

  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastPair = {
  name: string;
  foreground: keyof ThemeColors;
  background: keyof ThemeColors;
  minimum: number;
};

export const REQUIRED_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { name: 'chữ chính trên nền màn hình', foreground: 'text', background: 'background', minimum: AA_NORMAL_TEXT },
  { name: 'chữ chính trên card', foreground: 'text', background: 'surface', minimum: AA_NORMAL_TEXT },
  { name: 'chữ phụ trên nền màn hình', foreground: 'textMuted', background: 'background', minimum: AA_NORMAL_TEXT },
  { name: 'chữ phụ trên card', foreground: 'textMuted', background: 'surface', minimum: AA_NORMAL_TEXT },
  { name: 'chữ trên nút chính', foreground: 'onPrimary', background: 'primary', minimum: AA_NORMAL_TEXT },
  { name: 'chữ trên nền primarySoft', foreground: 'onPrimarySoft', background: 'primarySoft', minimum: AA_NORMAL_TEXT },
  { name: 'chữ trên nút xoá', foreground: 'onDanger', background: 'danger', minimum: AA_NORMAL_TEXT },
  { name: 'chữ trên FAB', foreground: 'onAccent', background: 'accent', minimum: AA_NORMAL_TEXT },
  { name: 'giá tiền trên card', foreground: 'accent', background: 'surface', minimum: AA_NORMAL_TEXT },
  { name: 'chữ lỗi trên card', foreground: 'danger', background: 'surface', minimum: AA_NORMAL_TEXT },
  { name: 'chữ thành công trên card', foreground: 'success', background: 'surface', minimum: AA_NORMAL_TEXT },
  { name: 'placeholder trong ô nhập', foreground: 'placeholder', background: 'inputBackground', minimum: AA_LARGE_TEXT },
];

export type ContrastResult = {
  scenario: ColorSchemeName;
  pair: ContrastPair;
  ratio: number;
  passes: boolean;
};

export function auditContrast(scenarios: readonly ColorSchemeName[] = ['light', 'dark']): ContrastResult[] {
  const results: ContrastResult[] = [];

  for (const scenario of scenarios) {
    const { colors } = createTheme(scenario);

    for (const pair of REQUIRED_CONTRAST_PAIRS) {
      const ratio = contrastRatio(colors[pair.foreground], colors[pair.background]);
      results.push({ scenario, pair, ratio, passes: ratio >= pair.minimum });
    }
  }

  return results;
}
