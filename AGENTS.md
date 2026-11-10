This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

## Quy ước riêng của dự án này (Smart Catalog)

Đọc `README.md` để hiểu kiến trúc, schema và trạng thái từng phase trước khi sửa code.

### Chạy kiểm tra trước khi kết thúc task

```bash
npm run verify   # typecheck + eslint + jest — BẮT BUỘC pass
```

### Tầng & phụ thuộc (không được đảo chiều)

```
src/app → src/features → src/core
src/ui  → src/theme            (src/ui KHÔNG được import src/features)
```

- Route trong `src/app` chỉ compose; mọi logic nằm ở `features/*/services|hooks`.
- Truy cập dữ liệu **chỉ** qua repository lấy từ `useDependencies()`. Không viết SQL trong UI.
- Gọi mạng chỉ qua `src/core/api/httpClient.ts` (timeout + retry + AppError).

### Giao diện

- Chữ dùng `AppText`, nút dùng `Button`/`IconButton`, khung màn hình dùng `Screen`.
- **Cấm mã màu trực tiếp** trong `src/ui`, `src/app`, `src/features` (ESLint `no-restricted-syntax`
  sẽ báo lỗi). Dùng `useTheme().colors.*`.
- Mọi màn hình có dữ liệu phải xử lý đủ **loading / empty / error**.
- Nút chỉ có icon phải có `accessibilityLabel`; vùng chạm ≥ 44pt.

### Lỗi

- Ném `AppError` với `code` phù hợp + message **tiếng Việt** cho người dùng.
- Lỗi gốc đặt ở `cause`/`debugMessage` (chỉ để log), không hiển thị cho người dùng.
- Bọc lỗi từ tầng ngoài bằng `toAppError(error, 'storage' | 'ai_unavailable' | …)`.

### Dữ liệu

- Migration đánh số trong `src/core/db/migrations.ts`; **không sửa migration đã phát hành**,
  chỉ thêm version mới.
- `products.id` là UUID bất biến — QR dùng chính nó, không dùng tên sản phẩm.
- Bật `foreign_keys` là điều kiện để cascade hoạt động; đừng tắt.
- Ảnh lưu ra file qua `ImageStorage`, không nhét base64 vào DB.

### Alias & kiểu

- Import nội bộ dùng alias `@/…` (map tới `src/…`), không dùng `../../..`.
- TypeScript `strict` + `noUncheckedIndexedAccess`; **không dùng `any`**.

### Hợp đồng đã có, chưa hiện thực

- `src/features/ai/contracts.ts` (Phase 5)
- `src/features/qr/contracts.ts` (Phase 6)
- Bật tính năng bằng `src/core/config/features.ts` — chỉ bật khi tính năng chạy end-to-end thật.

### Công cụ dev

- `/dev/ui-gallery`: xem UI kit ở Light/Dark.
- `/dev/db-check`: kiểm CRUD + cascade trên thiết bị (Jest không chạy được `expo-sqlite`).
- Hai route này phải bị xoá trước khi build bản demo (Phase 7).

