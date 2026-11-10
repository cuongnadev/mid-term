import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/theme';
import { LoadingView, Screen } from '@/ui';

export default function AppGroupLayout() {
  const { colors } = useTheme();
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <Screen edges={['top', 'bottom']}>
        <LoadingView fullScreen label="Đang kiểm tra phiên đăng nhập…" />
      </Screen>
    );
  }

  if (status === 'signed_out') {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}