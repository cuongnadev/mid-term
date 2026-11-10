import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { suggestStrongPassword, type PasswordSuggestionResult } from '@/features/ai/aiService';
import { useTheme } from '@/theme';
import { AppText, Badge, Button } from '@/ui';

type Props = {
  onSuggested: (password: string) => void;
  disabled?: boolean;
};

export function PasswordSuggestButton({ onSuggested, disabled = false }: Props) {
  const { colors, radius, spacing } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PasswordSuggestionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSuggest = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setCopied(false);
    try {
      const suggestion = await suggestStrongPassword();
      setResult(suggestion);
      onSuggested(suggestion.password);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(result.password);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.actionRow}>
        <Button
          label="AI gợi ý mật khẩu mạnh"
          size="sm"
          variant="secondary"
          loading={loading}
          disabled={disabled}
          icon={<Ionicons name="sparkles-outline" size={16} color={colors.onPrimarySoft} />}
          onPress={() => {
            void handleSuggest();
          }}
        />
      </View>

      {result ? (
        <View
          style={[
            styles.tipBox,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.sm,
              gap: spacing.xs,
            },
          ]}
        >
          <View style={styles.tipHeader}>
            <Badge
              label={result.source === 'gemini' ? 'Gemini AI' : 'Tạo an toàn'}
              tone={result.source === 'gemini' ? 'primary' : 'success'}
            />
            {Platform.OS === 'web' ? (
              <Button
                label={copied ? 'Đã sao chép' : 'Sao chép'}
                size="sm"
                variant="ghost"
                onPress={() => {
                  void handleCopy();
                }}
              />
            ) : null}
          </View>
          <AppText variant="caption" tone="muted">
            {result.tip}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tipBox: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});