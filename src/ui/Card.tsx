import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { elevation, useTheme } from '@/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  level?: 0 | 1 | 2 | 3;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  onPress,
  padded = true,
  level = 1,
  accessibilityLabel,
  style,
}: Props) {
  const { colors, radius, spacing, scheme } = useTheme();

  const base: StyleProp<ViewStyle> = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: padded ? spacing.lg : 0,
    },
    level === 0 ? null : elevation(level, scheme),
    style,
  ];

  if (!onPress) {
    return <View style={base}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed ? { opacity: 0.9 } : null]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
