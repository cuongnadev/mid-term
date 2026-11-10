import {
  AA_LARGE_TEXT,
  AA_NORMAL_TEXT,
  REQUIRED_CONTRAST_PAIRS,
  auditContrast,
  contrastRatio,
  parseHexColor,
  relativeLuminance,
} from '../contrast';
import { createTheme } from '../tokens';

describe('parseHexColor', () => {
  it('đọc đúng #RRGGBB', () => {
    expect(parseHexColor('#0F4C5C')).toEqual({ r: 15, g: 76, b: 92 });
    expect(parseHexColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('từ chối giá trị không phải hex 6 chữ số', () => {
    expect(parseHexColor('rgba(0,0,0,0.5)')).toBeNull();
    expect(parseHexColor('#fff')).toBeNull();
    expect(parseHexColor('red')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('trắng sáng nhất, đen tối nhất', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('contrastRatio', () => {
  it('trắng trên đen đạt 21:1', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });

  it('đối xứng và bằng 1 với cùng màu', () => {
    const a = contrastRatio('#FFFFFF', '#0A1418');
    const b = contrastRatio('#0A1418', '#FFFFFF');
    expect(a).toBeCloseTo(b, 6);
    expect(contrastRatio('#12303A', '#12303A')).toBeCloseTo(1, 6);
  });
});

describe('bảng màu Light/Dark đạt ngưỡng tương phản WCAG AA', () => {
  const results = auditContrast();

  it('mọi cặp màu bắt buộc đều đạt', () => {
    const failures = results
      .filter((result) => !result.passes)
      .map(
        (result) =>
          `[${result.scenario}] ${result.pair.name}: ${result.ratio.toFixed(2)}:1 < ${result.pair.minimum}:1`,
      );

    expect(failures).toEqual([]);
  });

  it('có kiểm tra cho cả hai chế độ', () => {
    const scenarios = new Set(results.map((result) => result.scenario));
    expect([...scenarios].sort()).toEqual(['dark', 'light']);
    expect(results.length).toBe(REQUIRED_CONTRAST_PAIRS.length * 2);
  });

  it('mỗi cặp có ngưỡng hợp lệ (4.5 hoặc 3)', () => {
    for (const pair of REQUIRED_CONTRAST_PAIRS) {
      expect([AA_NORMAL_TEXT, AA_LARGE_TEXT]).toContain(pair.minimum);
    }
  });

  it('mọi màu dùng trong cặp đều đọc được dạng hex', () => {
    for (const scenario of ['light', 'dark'] as const) {
      const { colors } = createTheme(scenario);
      for (const pair of REQUIRED_CONTRAST_PAIRS) {
        expect(parseHexColor(colors[pair.foreground])).not.toBeNull();
        expect(parseHexColor(colors[pair.background])).not.toBeNull();
      }
    }
  });
});
