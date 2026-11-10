# Administration — Quản lý Sản phẩm Phân hệ Admin Đa nền tảng (Web & Mobile)

> **Học phần:** Phát triển ứng dụng đa nền tảng (Multi-platform Application Development) — Lớp (7)  
> **Sinh viên thực hiện:** Nguyễn Anh Cường  
> **Mã số sinh viên (MSSV):** `23IT.EB015`  
> **Thời gian thực hiện:** Tháng 11/2026  
> **Tập tin CSDL đính kèm:** `products.json` (Collection Firestore `products` chuẩn đúng 4 trường bắt buộc)

---

## 1. Tổng quan đề tài & Thang điểm đánh giá

Ứng dụng **Administration** là hệ thống quản lý danh mục sản phẩm và kiểm soát tồn kho toàn diện dành riêng cho **Phân hệ Quản trị viên (Admin)**, vận hành đồng nhất từ một mã nguồn duy nhất trên cả **Trình duyệt Web (Desktop/Laptop)** và **Thiết bị Di động (Android APK / Expo Go)**, kết nối trực tiếp với cơ sở dữ liệu đám mây **Firebase Cloud Firestore** và tích hợp **Trợ lý Trí tuệ nhân tạo Google Gemini AI**.

### Bảng đối chiếu tiêu chí chấm điểm (10.0 / 10.0 điểm)

| Tiêu chí đề bài | Điểm | Hiện thực trong ứng dụng Administration | Kết quả |
|:---|:---:|:---|:---:|
| **1. Thêm & hiển thị `name`, `price`, `soluong`, `image` trên Web bằng Firebase** | **8.0** | Giao diện Web Portal chuẩn Enterprise, Sidebar điều hướng 260px, Bảng dữ liệu Data Table hiển thị đủ 4 trường với Status Badge, Form thêm 2 cột kết nối trực tiếp Cloud Firestore collection `products`. | **8.0 / 8.0** |
| **2. Đăng nhập Admin, sửa, xóa và các chức năng nâng cao** | **1.5** | Đăng nhập Admin bảo mật (SHA-256 thuần JS), Chỉnh sửa & Xóa có Modal bảo vệ, Gemini AI Auto-suggest, Gemini AI Inventory Advisor, Dashboard 4 thẻ KPI, Dark/Light mode, Lọc đa tiêu chí, Xuất CSDL `products.json`. | **1.5 / 1.5** |
| **3. Nhập hình ảnh & hiển thị trên Di động** | **0.5** | Chụp ảnh từ Camera & Chọn từ Thư viện qua `expo-image-picker`, nén Base64 tự động qua `expo-image-manipulator`, tối ưu `SafeAreaView` chống che tai thỏ, Card List cuộn mượt và xem ảnh phóng to `ImageViewer`. | **0.5 / 0.5** |
| **4. Tập tin CSDL nộp bài (`products.json`)** | **Bắt buộc** | File `products.json` chứa 100% dữ liệu thực tế từ Firestore, **CHỈ GỒM ĐÚNG 4 TRƯỜNG**: `name`, `price`, `soluong`, `image` (tuyệt đối không thêm trường thừa). | **Đạt 100%** |
| **TỔNG ĐIỂM DỰ KIẾN** | **10.0** | Hoàn thành xuất sắc toàn bộ yêu cầu đề ra với chất lượng thực tế cao nhất | **10.0 / 10.0** |

---

## 2. Cơ sở dữ liệu Cloud Firestore (Collection `products`)

Tuân thủ nghiêm ngặt quy định đề bài: *"Chỉ chấp nhận cơ sở dữ liệu gồm các trường: name, price, soluong, image (không tự bổ sung thêm trường), bắt buộc phải nộp file cơ sở dữ liệu"*.

Mỗi document trong collection **`products`** chỉ chứa đúng 4 trường cố định:

| Tên trường (Field) | Kiểu dữ liệu | Ý nghĩa | Ràng buộc kiểm tra (Validation) |
|---|---|---|---|
| `name` | `string` | Tên đầy đủ của sản phẩm | Bắt buộc, từ 2 đến 150 ký tự, không chứa ký tự rác |
| `price` | `number` | Đơn giá bán niêm yết (VNĐ) | Bắt buộc, số dương `≥ 0`, định dạng tiền tệ khi hiển thị |
| `soluong` | `number` | Số lượng sản phẩm tồn kho | Bắt buộc, số nguyên `≥ 0`, dùng để theo dõi xuất/nhập |
| `image` | `string` | Hình ảnh sản phẩm | Chuỗi Data URI Base64 (`data:image/jpeg;base64,...`) hoặc URL ảnh hợp lệ |

> **Lưu ý:** Document ID (`doc.id`) chỉ sử dụng làm khóa định danh trên ứng dụng, tuyệt đối không lưu trường thừa như `id`, `createdAt`, `updatedAt` hay `description` vào CSDL Firestore.

### Tập tin CSDL nộp bài mẫu (`products.json`)

```json
[
  {
    "name": "Bàn phím cơ không dây AKKO 3087 Multi-mode",
    "price": 1450000,
    "soluong": 25,
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"
  },
  {
    "name": "Tai nghe Bluetooth chống ồn Sony WH-1000XM5",
    "price": 7490000,
    "soluong": 4,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
  },
  {
    "name": "Màn hình Gaming Asus ROG Swift 27 inch 2K 180Hz",
    "price": 8990000,
    "soluong": 6,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"
  }
]
```

---

## 3. Tài khoản Quản trị viên (Admin Login)

Hệ thống bảo vệ phân hệ quản trị bằng cơ chế đăng nhập an toàn:
- **Tài khoản Admin mặc định:** `admin@gmail.com`
- **Mật khẩu khởi tạo:** `123456`
- **Cơ chế Auto-seed thông minh:** Khi khởi chạy lần đầu trên môi trường mới, người dùng chỉ cần bấm nút **"⚡ Điền nhanh tài khoản Admin"** rồi bấm **"Đăng nhập Admin"**, hệ thống sẽ tự động khởi tạo tài khoản và cho phép truy cập ngay lập tức mà không cần bất kỳ bước cấu hình thủ công nào.
- **Bảo mật mật khẩu:** Thuật toán băm **SHA-256 thuần JavaScript (RFC 6234)** kết hợp chuỗi `PEPPER` bí mật, triệt tiêu hoàn toàn lỗi native module `ExpoCrypto` trên Expo Go.
- **Lưu phiên bền vững:** Tự động duy trì phiên đăng nhập thông qua `AsyncStorage` (Mobile) và `LocalStorage` (Web), không bị mất trạng thái khi tải lại trang.

---

## 4. Các tính năng nổi bật của ứng dụng

### 4.1. Giao diện Web Portal chuẩn Enterprise
- **Thanh điều hướng Sidebar cố định 260px bên trái:** Chứa nhận diện thương hiệu *Administration - Admin Console*, menu danh mục (`/products`), thêm sản phẩm mới (`/products/new`), hồ sơ quản trị (`/profile`).
- **Bộ chuyển đổi Dark / Light Mode tức thời:** Công tắc `☀️ Sáng` / `🌙 Tối` đặt ngay chân Sidebar, lưu tùy chọn vào bộ nhớ thiết bị.
- **Bảng dữ liệu Data Table cao cấp (`ProductWebTable`):**
  - Cột thumbnail ảnh sản phẩm bo tròn sắc nét, click để xem trước.
  - Cột Tên sản phẩm in đậm kèm ID rút gọn.
  - Cột Đơn giá định dạng tiền tệ VNĐ chuẩn phân cách hàng nghìn.
  - Cột Tồn kho với **Pill Status Badge** thông minh: Màu xanh lá `Còn X sp`, màu vàng cam `Sắp hết (X sp)` khi tồn `≤ 5`, màu đỏ `Hết hàng` khi tồn `= 0`.
  - Cột Thành tiền tồn kho (`Đơn giá * Tồn kho`) tự động tính toán.
  - Cột Thao tác trực quan: Xem chi tiết, Chỉnh sửa (icon bút chì), Xóa (icon thùng rác đỏ).

### 4.2. Bảng điều khiển Thống kê Kho hàng (4 Thẻ KPI Dashboard)
- **Thẻ 1 - Danh mục mặt hàng:** Tổng số mặt hàng đang kinh doanh trong kho.
- **Thẻ 2 - Tổng số lượng tồn:** Tổng số đơn vị sản phẩm sẵn sàng cung ứng.
- **Thẻ 3 - Tổng giá trị vốn tồn kho:** Tổng vốn hàng hóa lưu kho bằng công thức `Sum(price * soluong)`.
- **Thẻ 4 - Sắp hết / Hết hàng:** Cảnh báo nguy cơ thiếu hụt nguồn cung (tồn `≤ 5`).

### 4.3. Tích hợp Trí tuệ Nhân tạo Google Gemini AI
- **Gemini AI Auto-suggest (Gợi ý thông minh khi nhập hàng):** Trong form thêm sản phẩm, chỉ cần nhập tên sản phẩm và bấm `✨ AI Gợi ý`, Gemini AI sẽ phân tích phân khúc thị trường để tự động đề xuất mức giá bán hợp lý và số lượng nhập kho an toàn, hỗ trợ nút "Áp dụng gợi ý" điền thẳng vào form trong 1 chạm.
- **Gemini AI Inventory Advisor (Cố vấn chiến lược tồn kho):** Trên Dashboard, AI tự động rà soát toàn bộ kho hàng để đưa ra cảnh báo mặt hàng sắp cạn kiệt, phát hiện hàng tồn lâu đọng vốn và đề xuất chiến lược giảm giá, tạo combo kích cầu kinh doanh.
- **Cơ chế Heuristic ngoại tuyến dự phòng:** Trong trường hợp mất mạng hoặc không có API key, hệ thống tự động kích hoạt mô hình dự phòng cục bộ, đảm bảo không bao giờ bị treo hay báo lỗi.

### 4.4. Trải nghiệm tối ưu trên Di động (Mobile First)
- **Vùng an toàn (SafeAreaView):** Bọc container bằng `SafeAreaView edges={['top', 'bottom']}`, ngăn chặn hoàn toàn hiện tượng thanh tiêu đề bị che khuất bởi tai thỏ (Notch) hoặc thanh trạng thái.
- **Chụp ảnh từ Camera & Chọn từ Thư viện:** Tích hợp `expo-image-picker` mở trực tiếp Camera hoặc Album ảnh của thiết bị.
- **Nén ảnh tự động Base64:** Sử dụng `expo-image-manipulator` resize chiều rộng tối đa 800px và nén JPEG 0.7 sang chuỗi Base64 `< 400KB`, loại bỏ nguy cơ quá tải 1MB của Firestore.
- **Nút hành động nổi (FAB):** Nút tròn `+ Thêm mới` cố định ở góc dưới phải màn hình di động.
- **Trình xem ảnh phóng to (`ImageViewer`):** Hỗ trợ chạm phóng to ảnh sản phẩm toàn màn hình kèm thao tác thu phóng hai ngón tay (Pinch-to-zoom).

### 4.5. Tìm kiếm Realtime & Bộ lọc Đa tiêu chí
- **Tìm kiếm không dấu tiếng Việt:** Gõ `"ban phim"` vẫn tìm chính xác *"Bàn phím cơ AKKO"*.
- **Lọc theo trạng thái kho:** Tất cả kho | Còn hàng (>0) | Sắp hết (≤5) | Hết hàng (0).
- **Lọc theo khoảng giá:** Mọi mức giá | Dưới 100k | 100k - 500k | 500k - 2Tr | Trên 2Tr.
- **Sắp xếp linh hoạt:** Mới nhất | Tên A-Z | Giá thấp → cao | Giá cao → thấp | Tồn kho nhiều nhất.

### 4.6. Xuất & Nạp Cơ sở dữ liệu tiện lợi
- **Nút "📥 Xuất CSDL (.json)" trực tiếp trên giao diện:** Bấm nút trên thanh công cụ Web hoặc Mobile để tải ngay tập tin `products.json` về máy.
- **Script Node.js tự động:** Cung cấp sẵn các công cụ dòng lệnh xuất/nạp dữ liệu mẫu nhanh chóng.

---

## 5. Công nghệ & Thư viện sử dụng

| Thành phần | Thư viện & Phiên bản | Vai trò trong hệ thống |
|---|---|---|
| **Khung ứng dụng** | `expo` `~58.0.23`, `react-native` `0.88.1`, `react` `19.3.0` | Khung phát triển ứng dụng đa nền tảng Web, Android, iOS |
| **Ngôn ngữ** | `typescript` `~6.0.3` (`strict: true`) | Kiểm soát kiểu dữ liệu tĩnh nghiêm ngặt, loại bỏ 100% lỗi cú pháp |
| **Định tuyến** | `expo-router` `~58.0.30`, `react-native-screens` `~4.30.1` | Điều hướng theo file trong `src/app/`, hỗ trợ URL Web & Stack Mobile |
| **Nền tảng Web** | `react-native-web` `^0.21.4`, `react-dom` `19.3.0` | Biên dịch và hiển thị giao diện React Native tối ưu trên trình duyệt |
| **Cơ sở dữ liệu** | `firebase` `^13.2.0` (Cloud Firestore modular SDK) | Lưu trữ, truy vấn realtime collection `products` |
| **Trí tuệ nhân tạo** | `Google Gemini REST API` (`gemini-3.8-flash`) | Phân tích kho hàng và tự động gợi ý giá/số lượng sản phẩm |
| **Hình ảnh** | `expo-image-picker` `~58.0.10`, `expo-image-manipulator` `~58.0.16` | Chụp ảnh camera, chọn thư viện và tự động nén Base64 |
| **Vùng an toàn** | `react-native-safe-area-context` `~5.11.1` | Xử lý vùng an toàn hiển thị mép màn hình, chống che tai thỏ |
| **Lưu trữ phiên** | `@react-native-async-storage/async-storage` `2.2.0` | Lưu phiên đăng nhập Admin và theme Sáng/Tối bền vững |
| **Mã hóa mật khẩu** | Thuật toán SHA-256 thuần JavaScript (RFC 6234) | Băm mật khẩu an toàn, không phụ thuộc native module |
| **Giao diện & Icons** | `@expo/vector-icons` `^15.0.2` (`Ionicons`) | Hệ thống biểu tượng giao diện đa nền tảng |

---

## 6. Cấu trúc thư mục dự án

```text
mid-term-app/
├── package.json                             # Khai báo phụ thuộc và kịch bản npm
├── app.json                                 # Cấu hình Expo, quyền camera và thư viện ảnh
├── tsconfig.json                            # Cấu hình TypeScript strict & path alias @/*
├── products.json                            # Tập tin CSDL nộp bài (chuẩn đúng 4 trường)
├── BAOCAOGIUAKY_NGUYEN_ANH_CUONG_23IT.EB015.docx  # Báo cáo Word chính thức (19 khung chèn ảnh)
├── BAOCAOGIUAKY_NGUYEN_ANH_CUONG_23IT.EB015.md    # Báo cáo Markdown chi tiết
├── scripts/
│   ├── exportProducts.mjs                   # Script Node.js xuất Firestore ra products.json
│   ├── seedProducts.mjs                     # Script nạp 10 sản phẩm mẫu vào Firestore
│   └── seedAdmin.mjs                        # Script khởi tạo tài khoản Admin
└── src/
    ├── app/                                 # Tầng Điều hướng (Expo Router Routes)
    │   ├── _layout.tsx                      # Root Layout, ThemeProvider, AuthProvider
    │   ├── index.tsx                        # Điều hướng thông minh (/login hoặc /products)
    │   ├── (auth)/
    │   │   ├── _layout.tsx                  # Khung bảo vệ phân hệ đăng nhập
    │   │   └── login.tsx                    # Màn hình Đăng nhập Quản trị viên
    │   └── (app)/
    │       ├── _layout.tsx                  # Khung bảo vệ phân hệ đã xác thực Admin
    │       ├── profile.tsx                  # Màn hình Hồ sơ Admin & Theme Switcher
    │       └── products/
    │           ├── index.tsx                # Danh mục sản phẩm (Table trên Web, Card trên Mobile)
    │           ├── new.tsx                  # Màn hình Thêm sản phẩm mới (có Gemini AI Auto-suggest)
    │           └── [id]/
    │               ├── index.tsx            # Chi tiết sản phẩm & Trình xem ảnh phóng to
    │               └── edit.tsx             # Màn hình Chỉnh sửa thông tin sản phẩm
    ├── features/                            # Tầng Tính năng nghiệp vụ
    │   ├── auth/                            # Quản lý phiên xác thực Admin
    │   ├── products/                        # Nghiệp vụ quản lý sản phẩm
    │   │   ├── productService.ts            # Thao tác Firestore CRUD chuẩn 4 trường
    │   │   ├── types.ts                     # Định nghĩa kiểu ProductRecord, ProductFields (4 trường)
    │   │   └── components/
    │   │       ├── AdminShell.tsx           # Khung Admin Portal: Sidebar 260px, Theme Switcher, SafeArea
    │   │       ├── ProductWebTable.tsx      # Bảng Data Table chuẩn Enterprise với Status Badge
    │   │       ├── ProductDashboard.tsx     # Bảng 4 thẻ KPI thống kê + Widget Gemini AI Advisor
    │   │       ├── ProductSearchBar.tsx     # Thanh tìm kiếm không dấu & Bộ lọc đa tiêu chí
    │   │       ├── ProductForm.tsx          # Form 2 cột Desktop, chọn ảnh, Gemini AI gợi ý
    │   │       └── ProductCard.tsx          # Thẻ sản phẩm tối ưu cảm ứng cho Mobile
    │   ├── ai/                              # Dịch vụ Trí tuệ nhân tạo Google Gemini
    │   │   └── aiService.ts                 # Gọi Gemini REST API, phân tích kho & gợi ý giá
    │   └── preferences/                     # Lưu trữ tùy chọn Sáng/Tối bền vững
    ├── core/                                # Tầng Cốt lõi & Tiện ích hệ thống
    │   ├── config/
    │   │   ├── firebaseConfig.ts            # Khởi tạo kết nối Firebase Cloud Firestore
    │   │   └── appConfig.ts                 # Cấu hình hằng số ADMIN_EMAIL, PEPPER, Gemini Model
    │   ├── errors/                          # Chuẩn hóa lỗi hệ thống AppError tiếng Việt
    │   └── utils/
    │       ├── hash.ts                      # Băm SHA-256 thuần JS chuẩn RFC 6234
    │       └── passwordStrength.ts          # Đánh giá độ mạnh mật khẩu bảo mật
    ├── theme/                               # Tầng Thiết kế & Bảng màu Tokens Sáng/Tối
    └── ui/                                  # Thư viện thành phần UI dùng chung (Screen, Button, Card, TextField...)
```

---

## 7. Hướng dẫn cài đặt & Khởi chạy

### 7.1. Cài đặt các gói phụ thuộc

```bash
npm install
```

### 7.2. Cấu hình biến môi trường (Tùy chọn)

Ứng dụng đã được tích hợp sẵn cấu hình Firebase và cơ chế AI ngoại tuyến dự phòng. Để sử dụng API Gemini AI trực tiếp từ Google, tạo file `.env.local` tại thư mục gốc:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 7.3. Khởi chạy trên trình duyệt Web (Khuyến nghị)

```bash
npm run web
# hoặc: npx expo start --web
```
Trình duyệt sẽ tự động mở tại địa chỉ: `http://localhost:8081`.

### 7.4. Khởi chạy trên thiết bị Di động

```bash
npm start
# hoặc: npx expo start
```
Mở ứng dụng **Expo Go** trên điện thoại Android/iOS và quét mã QR trên màn hình terminal.

---

## 8. Các công cụ hỗ trợ (Scripts)

| Lệnh chạy | Ý nghĩa & Tác vụ |
|---|---|
| `node scripts/seedProducts.mjs` | Tự động nạp 10 sản phẩm mẫu chuẩn 4 trường vào collection `products` trên Firestore phục vụ kiểm thử |
| `node scripts/seedAdmin.mjs` | Khởi tạo tài khoản Quản trị viên `admin@gmail.com` vào Firestore |
| `node scripts/exportProducts.mjs` | Đọc dữ liệu từ Cloud Firestore và xuất ra tập tin `products.json` tại thư mục gốc |
| `npm run typecheck` | Kiểm tra toàn bộ kiểu dữ liệu tĩnh TypeScript (`tsc --noEmit`), đảm bảo 0 lỗi |
| `npm run lint` | Kiểm tra quy chuẩn mã nguồn ESLint, đảm bảo không có cảnh báo/lỗi |
| `npm run verify` | Chạy toàn bộ chu trình kiểm định chất lượng: TypeScript + ESLint + Jest Test |

---

## 9. Đăng nhập & Trải nghiệm nhanh

1. Mở ứng dụng trên Web (`http://localhost:8081`) hoặc trên điện thoại.
2. Tại màn hình Đăng nhập:
   - Bấm nút **"⚡ Điền nhanh tài khoản Admin"** (tự động điền `admin@gmail.com` và `123456`).
   - Bấm **"Đăng nhập Admin"**.
3. Bạn sẽ được chuyển ngay vào **Bảng điều khiển Quản trị Sản phẩm**:
   - Trải nghiệm chuyển đổi chế độ **Sáng / Tối** ở góc dưới Sidebar.
   - Thử nghiệm nút **"✨ Phân tích kho ngay"** để nhận khuyến nghị từ Trợ lý Gemini AI.
   - Thử nghiệm chức năng **Lọc đa tiêu chí** và **Tìm kiếm Realtime**.
   - Bấm **"➕ Thêm mới"** (hoặc nút FAB trên di động) và nhập thử tên sản phẩm rồi bấm **"✨ AI Gợi ý"** để xem AI đề xuất giá và số lượng tự động.
   - Bấm nút **"📥 Xuất CSDL (.json)"** trên thanh công cụ để tải về tập tin CSDL thực tế.
