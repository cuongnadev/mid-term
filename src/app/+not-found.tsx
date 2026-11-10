import { router } from 'expo-router';
import { Card, EmptyState, PageHeader, Screen } from '@/ui';

export default function NotFoundScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <PageHeader title="Không tìm thấy trang" showBack />
      <Card>
        <EmptyState
          icon="help-circle-outline"
          title="Đường dẫn không hợp lệ"
          message="Trang bạn mở không tồn tại hoặc đã bị gỡ khỏi ứng dụng."
          actionLabel="Về trang chính"
          onAction={() => router.replace('/')}
        />
      </Card>
    </Screen>
  );
}