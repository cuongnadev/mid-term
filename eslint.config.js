// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/** Bắt lỗi "hard-code màu" — quy tắc kiến trúc: theme là nguồn màu duy nhất. */
const noLiteralColors = {
  files: ['src/ui/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,8})$/]',
        message: 'Không viết mã màu trực tiếp. Dùng token: useTheme().colors.* (xem src/theme/tokens.ts).',
      },
      {
        selector: 'Literal[value=/^rgba?\\(/]',
        message: 'Không viết mã màu trực tiếp. Dùng token: useTheme().colors.* (xem src/theme/tokens.ts).',
      },
    ],
  },
};

module.exports = defineConfig([
  expoConfig,
  {
    // .expo: file do Expo sinh ra (types của router, cache) — không lint.
    ignores: ['dist/*', '.expo-export/*', '.expo/*'],
  },
  {
    // File setup của Jest chạy trong môi trường Node (có global `jest`).
    files: ['jest.setup.js'],
    languageOptions: {
      globals: { jest: 'readonly' },
    },
  },
  noLiteralColors,
]);
