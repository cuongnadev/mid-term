const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function toNfc(input: string): string {
  try {
    return input.normalize('NFC');
  } catch {
    return input;
  }
}

export function normalizeText(input: string): string {
  return toNfc(input).replace(/\s+/g, ' ').trim();
}

export function normalizeMultiline(input: string): string {
  return toNfc(input)
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function fold(input: string): string {
  let text = input;
  try {
    text = text.normalize('NFD');
  } catch {
  }
  return text.replace(COMBINING_MARKS, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

export function slugify(input: string): string {
  return fold(normalizeText(input))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(input: string, maxLength: number, ellipsis = '…'): string {
  if (maxLength <= 0) return '';
  const characters = Array.from(input);
  if (characters.length <= maxLength) return input;
  return characters.slice(0, Math.max(1, maxLength - ellipsis.length)).join('').trimEnd() + ellipsis;
}

export function initials(input: string): string {
  const first = Array.from(input.trim())[0];
  return first ? first.toUpperCase() : '?';
}

export function isBlank(input: string): boolean {
  return input.trim().length === 0;
}

export function matchesQuery(text: string, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fold(text);
  return words.every((word) => haystack.includes(word));
}
