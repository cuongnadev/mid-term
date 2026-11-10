// Mock các module native cần cho test chạy trong Node.
//
// Vì sao cần: repository sinh ID bằng `expo-crypto.randomUUID()` — module native
// không tồn tại trong Jest. Mock này trả UUID *tăng dần* (không phải hằng số)
// để mỗi bản ghi có ID khác nhau, tránh đụng khoá chính.
jest.mock('expo-crypto', () => {
  let counter = 0;

  return {
    randomUUID: () => {
      counter += 1;
      return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
    },
  };
});
