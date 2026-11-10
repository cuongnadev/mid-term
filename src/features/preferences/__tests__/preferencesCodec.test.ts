import {
  DEFAULT_PREFERENCES,
  decodePreferences,
  encodePreference,
  parseThemeMode,
  parseViewMode,
} from '../preferencesCodec';

describe('parseThemeMode', () => {
  it('chấp nhận 3 giá trị hợp lệ', () => {
    expect(parseThemeMode('light')).toBe('light');
    expect(parseThemeMode('dark')).toBe('dark');
    expect(parseThemeMode('system')).toBe('system');
  });

  it('về mặc định với giá trị lạ (dữ liệu bản cũ / bị sửa tay)', () => {
    expect(parseThemeMode('neon')).toBe('system');
    expect(parseThemeMode('')).toBe('system');
    expect(parseThemeMode(null)).toBe('system');
    expect(parseThemeMode(undefined)).toBe('system');
  });
});

describe('parseViewMode', () => {
  it('chấp nhận grid/list', () => {
    expect(parseViewMode('grid')).toBe('grid');
    expect(parseViewMode('list')).toBe('list');
  });

  it('về mặc định với giá trị lạ', () => {
    expect(parseViewMode('table')).toBe('grid');
    expect(parseViewMode(null)).toBe('grid');
  });
});

describe('decodePreferences', () => {
  it('không có dòng nào thì dùng mặc định', () => {
    expect(decodePreferences([])).toEqual(DEFAULT_PREFERENCES);
  });

  it('ghép nhiều dòng key/value', () => {
    expect(
      decodePreferences([
        { key: 'theme', value: 'dark' },
        { key: 'viewMode', value: 'list' },
      ]),
    ).toEqual({ theme: 'dark', viewMode: 'list' });
  });

  it('bỏ qua key lạ và giá trị hỏng', () => {
    expect(
      decodePreferences([
        { key: 'somethingElse', value: 'x' },
        { key: 'theme', value: 'video' },
      ]),
    ).toEqual({ theme: 'system', viewMode: 'grid' });
  });

  it('dòng sau ghi đè dòng trước cùng key', () => {
    expect(
      decodePreferences([
        { key: 'theme', value: 'light' },
        { key: 'theme', value: 'dark' },
      ]).theme,
    ).toBe('dark');
  });
});

describe('encodePreference', () => {
  it('chuẩn hoá giá trị trước khi ghi', () => {
    expect(encodePreference('theme', 'dark')).toBe('dark');
    expect(encodePreference('viewMode', 'list')).toBe('list');
  });
});
