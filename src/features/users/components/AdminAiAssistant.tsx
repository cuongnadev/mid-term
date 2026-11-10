import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hasGeminiApiKey } from '@/core/config/appConfig';
import { askAdminAiAssistant, type AdminAiResult } from '@/features/ai/aiService';
import type { UserRecord } from '@/features/users/types';
import { useTheme } from '@/theme';
import { AppText, Badge, Button, Card, Chip, TextField } from '@/ui';

type Props = {
  users: readonly UserRecord[];
  activeResult: AdminAiResult | null;
  onResult: (result: AdminAiResult | null) => void;
};

const QUICK_PROMPTS = [
  'Tìm người chưa có ảnh',
  'Tóm tắt danh sách',
  'Tài khoản thường',
  'Tìm tài khoản Admin',
];

export function AdminAiAssistant({ users, activeResult, onResult }: Props) {
  const { colors, radius, spacing } = useTheme();
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  const runQuery = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || asking) return;

    setAsking(true);
    try {
      const result = await askAdminAiAssistant(trimmed, users);
      onResult(result);
    } finally {
      setAsking(false);
    }
  };

  return (
    <Card>
      <View style={{ gap: spacing.md }}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <AppText variant="subheading">Trợ lý AI quản trị</AppText>
          </View>
          <Badge
            label={hasGeminiApiKey() ? 'Gemini AI' : 'Chế độ cục bộ'}
            tone={hasGeminiApiKey() ? 'primary' : 'muted'}
          />
        </View>

        <View style={[styles.inputRow, { gap: spacing.sm }]}>
          <TextField
            value={question}
            onChangeText={setQuestion}
            placeholder="Ví dụ: Tìm người chưa có ảnh đại diện..."
            returnKeyType="search"
            containerStyle={{ flex: 1 }}
            onSubmitEditing={() => {
              void runQuery(question);
            }}
          />
          <Button
            label="Hỏi AI"
            loading={asking}
            onPress={() => {
              void runQuery(question);
            }}
            style={styles.askButton}
          />
        </View>

        <View style={[styles.chipsRow, { gap: spacing.xs }]}>
          {QUICK_PROMPTS.map((item) => (
            <Chip
              key={item}
              label={item}
              active={false}
              onPress={() => {
                setQuestion(item);
                void runQuery(item);
              }}
            />
          ))}
        </View>

        {activeResult ? (
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.primary,
                borderRadius: radius.md,
                padding: spacing.md,
                gap: spacing.xs,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <Badge
                label={activeResult.source === 'gemini' ? 'Trả lời từ Gemini AI' : 'Phân tích cục bộ'}
                tone={activeResult.source === 'gemini' ? 'primary' : 'accent'}
              />
              <Button
                label="Đóng / Bỏ lọc"
                size="sm"
                variant="ghost"
                onPress={() => onResult(null)}
              />
            </View>

            <AppText variant="body">{activeResult.answer}</AppText>

            {activeResult.matchedIds !== null ? (
              <AppText variant="caption" tone="primary">
                Đang lọc danh sách bên dưới theo {activeResult.matchedIds.length} kết quả từ AI.
              </AppText>
            ) : null}

            {activeResult.note ? (
              <AppText variant="caption" tone="muted">
                {activeResult.note}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  askButton: {
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultBox: {
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});