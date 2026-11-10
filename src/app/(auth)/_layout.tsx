import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/theme';
import { LoadingView, Screen } from '@/ui';

export default function AuthGroupLayout() {
  const { colors } = useTheme();
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <Screen edges={['top', 'bottom']}>
        <LoadingView fullScreen label="Đang tải…" />
      </Screen>
    );
  }

  if (status === 'signed_in') {
    return <Redirect href="/products" />;
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