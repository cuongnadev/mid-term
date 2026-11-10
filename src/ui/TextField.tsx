import { useEffect, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

const WEB_RESET_STYLE_ID = 'textfield-web-reset';

function ensureWebInputResetStyle(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(WEB_RESET_STYLE_ID)) return;

  const styleElement = document.createElement('style');
  styleElement.id = WEB_RESET_STYLE_ID;
  styleElement.textContent = `
    input:focus,
    input:focus-visible,
    textarea:focus,
    textarea:focus-visible {
      outline: none !important;
      outline-style: none !important;
      outline-width: 0 !important;
      box-shadow: none !important;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      transition: background-color 99999s ease-in-out 0s;
    }
  `;
  document.head.appendChild(styleElement);
}

type Props = Omit<TextInputProps, 'style' | 'editable' | 'ref'> & {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  label?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  showCounter?: boolean;
  rightSlot?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function TextField({
  label,
  error,
  hint,
  required = false,
  disabled = false,
  showCounter = false,
  rightSlot,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  multiline,
  value,
  ref,
  ...rest
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    ensureWebInputResetStyle();
  }, []);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  const length = typeof value === 'string' ? value.length : 0;
  const maxLength = rest.maxLength;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <AppText variant="label">
          {label}
          {required ? (
            <AppText variant="label" tone="danger">
              {' *'}
            </AppText>
          ) : null}
        </AppText>
      ) : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: disabled ? colors.surfaceAlt : colors.inputBackground,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <TextInput
          {...rest}
          ref={ref}
          value={value}
          multiline={multiline}
          editable={!disabled}
          placeholderTextColor={colors.placeholder}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.transparent,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            },
            Platform.OS === 'web' ? styles.webInput : null,
            multiline ? styles.multiline : null,
            inputStyle,
          ]}
        />
        {rightSlot}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerText}>
          {error ? (
            <AppText variant="caption" tone="danger">
              {error}
            </AppText>
          ) : hint ? (
            <AppText variant="caption" tone="muted">
              {hint}
            </AppText>
          ) : null}
        </View>
        {showCounter && maxLength !== undefined ? (
          <AppText variant="caption" tone="muted">
            {length}/{maxLength}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
  },
  webInput: {
    outlineWidth: 0,
    outlineStyle: 'none' as TextStyle['outlineStyle'],
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  footerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  footerText: { flex: 1 },
});