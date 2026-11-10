import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/AuthContext';
import { LoadingView, Screen } from '@/ui';

export default function IndexRedirectScreen() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <Screen edges={['top', 'bottom']}>
        <LoadingView fullScreen label="Đang khởi động hệ thống quản trị…" />
      </Screen>
    );
  }

  if (status === 'signed_out') {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/products" />;
}
