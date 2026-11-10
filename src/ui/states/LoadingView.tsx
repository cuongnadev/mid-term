import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from '../AppText';

type Props = {
  label?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LoadingView({ label = 'Đang tải…', fullScreen = false, style }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[styles.center, fullScreen ? styles.fullScreen : null, { gap: spacing.sm }, style]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  fullScreen: { flex: 1 },
});
