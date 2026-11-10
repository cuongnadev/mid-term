import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { elevation, useTheme } from '@/theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function Fab({ label, icon, onPress, accessibilityLabel }: Props) {
  const { colors, radius, spacing, scheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.accent,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        },
        elevation(2, scheme),
        pressed ? { opacity: 0.85 } : null,
      ]}
    >
      {icon}
      <AppText variant="bodyStrong" style={{ color: colors.onAccent }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
