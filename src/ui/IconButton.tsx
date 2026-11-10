import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'plain' | 'soft';
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  selected = false,
  disabled = false,
  testID,
  style,
}: Props) {
  const { colors, radius, touch } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      style={({ pressed }) => [
        {
          minWidth: touch.min,
          minHeight: touch.min,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.pill,
          backgroundColor: variant === 'soft' || selected ? colors.primarySoft : colors.transparent,
        },
        pressed ? { opacity: 0.7 } : null,
        disabled ? { opacity: 0.4 } : null,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}
