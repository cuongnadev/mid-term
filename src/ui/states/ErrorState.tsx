import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { AppText } from '../AppText';
import { Button } from '../Button';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: IoniconName;
};

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  message,
  onRetry,
  retryLabel = 'Thử lại',
  icon = 'alert-circle-outline',
}: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessibilityRole="alert"
      style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.sm }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.dangerSoft,
          marginBottom: spacing.xs,
        }}
      >
        <Ionicons name={icon} size={30} color={colors.danger} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="body" tone="muted" align="center">
        {message}
      </AppText>
      {onRetry ? (
        <Button label={retryLabel} variant="secondary" onPress={onRetry} style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}
