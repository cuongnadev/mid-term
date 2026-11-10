import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme, type TypographyVariant } from '@/theme';

export type TextTone =
  | 'default'
  | 'muted'
  | 'inverse'
  | 'primary'
  | 'onPrimary'
  | 'primarySoft'
  | 'accent'
  | 'danger'
  | 'success';

type Props = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
};

export function AppText({ variant = 'body', tone = 'default', align, style, ...rest }: Props) {
  const { colors, typography } = useTheme();

  const toneColor: Record<TextTone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    inverse: colors.textInverse,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primarySoft: colors.onPrimarySoft,
    accent: colors.accent,
    danger: colors.danger,
    success: colors.success,
  };

  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color: toneColor[tone] },
        align === undefined ? null : { textAlign: align },
        style,
      ]}
    />
  );
}
