import { Pressable, StyleSheet } from 'react-native';
import { hitSlop, useTheme } from '@/theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  active?: boolean;
  count?: number;
  disabled?: boolean;
};

export function Chip({ label, onPress, active = false, count, disabled = false }: Props) {
  const { colors, radius, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md + 2,
        },
        pressed ? { opacity: 0.8 } : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <AppText variant="label" style={{ color: active ? colors.onPrimary : colors.primary }}>
        {label}
      </AppText>
      {count === undefined ? null : (
        <AppText
          variant="caption"
          style={{
            color: active ? colors.onPrimary : colors.textMuted,
            backgroundColor: active ? colors.transparent : colors.surfaceAlt,
            borderRadius: radius.sm,
            paddingHorizontal: 6,
            overflow: 'hidden',
          }}
        >
          {count}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    borderWidth: 1,
  },
});
