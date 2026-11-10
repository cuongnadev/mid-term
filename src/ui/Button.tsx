import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  accessibilityLabel,
  testID,
  style,
}: Props) {
  const { colors, radius, spacing, touch } = useTheme();

  const palette: Record<ButtonVariant, { background: string; foreground: string }> = {
    primary: { background: colors.primary, foreground: colors.onPrimary },
    secondary: { background: colors.primarySoft, foreground: colors.onPrimarySoft },
    ghost: { background: colors.transparent, foreground: colors.primary },
    danger: { background: colors.danger, foreground: colors.onDanger },
  };
  const { background, foreground } = palette[variant];
  const isSmall = size === 'sm';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      testID={testID}
      hitSlop={isSmall ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderRadius: isSmall ? radius.sm : radius.md,
          minHeight: isSmall ? touch.control : touch.button,
          paddingHorizontal: isSmall ? spacing.md : spacing.lg,
        },
        fullWidth ? styles.fullWidth : null,
        pressed ? { opacity: 0.82 } : null,
        inactive ? { opacity: 0.5 } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <>
          {icon}
          <AppText variant={isSmall ? 'label' : 'bodyStrong'} style={{ color: foreground }}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: { alignSelf: 'stretch' },
});
