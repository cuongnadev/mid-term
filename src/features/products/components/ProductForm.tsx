import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickAndCompressImage, type ImagePickSource } from '@/core/utils';
import { suggestProductDetails } from '@/features/ai/aiService';
import { useTheme } from '@/theme';
import { AppText, Button, Card, TextField } from '@/ui';
import type { CreateProductInput, ProductAiSuggestion } from '../types';

type Props = {
  initialValues?: Partial<CreateProductInput>;
  onSubmit: (values: CreateProductInput) => Promise<void>;
  submitLabel: string;
};

export function ProductForm({ initialValues, onSubmit, submitLabel }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width >= 768;

  const [name, setName] = useState(initialValues?.name ?? '');
  const [priceStr, setPriceStr] = useState(
    initialValues?.price !== undefined ? String(initialValues.price) : '',
  );
  const [soluongStr, setSoluongStr] = useState(
    initialValues?.soluong !== undefined ? String(initialValues.soluong) : '',
  );
  const [image, setImage] = useState(initialValues?.image ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<ProductAiSuggestion | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePickImage = async (source: ImagePickSource) => {
    try {
      setFormError(null);
      const res = await pickAndCompressImage(source);
      if (res.status === 'picked') {
        setImage(res.base64Uri);
      } else if (res.status === 'permission-denied') {
        setFormError('Ứng dụng cần cấp quyền truy cập để chọn hoặc chụp ảnh.');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Không thể xử lý ảnh.';
      setFormError(msg);
    }
  };

  const handleAiSuggest = async () => {
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên sản phẩm trước khi yêu cầu AI gợi ý.');
      return;
    }
    setAiLoading(true);
    setFormError(null);
    try {
      const res = await suggestProductDetails(name);
      setAiSuggestion(res);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Không thể lấy gợi ý AI.';
      setFormError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setPriceStr(String(aiSuggestion.suggestedPrice));
    setSoluongStr(String(aiSuggestion.suggestedSoluong));
  };

  const handleSubmit = async () => {
    setFormError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Tên sản phẩm không được để trống.');
      return;
    }

    const price = Number(priceStr.replace(/[^0-9.-]+/g, ''));
    if (Number.isNaN(price) || price < 0) {
      setFormError('Giá sản phẩm không hợp lệ.');
      return;
    }

    const soluong = Math.floor(Number(soluongStr.replace(/[^0-9.-]+/g, '')));
    if (Number.isNaN(soluong) || soluong < 0) {
      setFormError('Số lượng sản phẩm không hợp lệ.');
      return;
    }

    if (!image.trim()) {
      setFormError('Vui lòng chọn hoặc chụp ảnh cho sản phẩm.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        price,
        soluong,
        image: image.trim(),
      });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Có lỗi khi lưu sản phẩm.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={{ padding: spacing.lg }}>
        <View style={isWebWide ? styles.twoColumns : undefined}>
          <View style={isWebWide ? styles.columnLeft : undefined}>
            <View style={styles.fieldHeader}>
              <AppText variant="subheading">Tên sản phẩm *</AppText>
              <Button
                label={aiLoading ? 'Đang nghĩ…' : '✨ AI Gợi ý'}
                variant="secondary"
                size="sm"
                onPress={handleAiSuggest}
                disabled={aiLoading}
              />
            </View>

            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Ví dụ: Bàn phím cơ không dây AKKO 3087"
            />

            {aiLoading ? (
              <View style={styles.aiLoadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="caption" tone="muted" style={{ marginLeft: 8 }}>
                  Gemini AI đang phân tích định giá và tồn kho đề xuất…
                </AppText>
              </View>
            ) : null}

            {aiSuggestion ? (
              <View style={[styles.aiBox, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <AppText variant="label" tone="primary" style={{ marginLeft: 6 }}>
                    Gợi ý từ {aiSuggestion.source === 'gemini' ? 'Gemini AI' : 'AI Cục bộ'}
                  </AppText>
                </View>
                <AppText variant="caption" style={{ marginTop: 4 }}>
                  • Giá đề xuất: <AppText variant="caption" style={{ fontWeight: '700' }}>{aiSuggestion.suggestedPrice.toLocaleString('vi-VN')} đ</AppText>
                </AppText>
                <AppText variant="caption">
                  • Tồn kho ban đầu: <AppText variant="caption" style={{ fontWeight: '700' }}>{aiSuggestion.suggestedSoluong} sp</AppText>
                </AppText>
                <AppText variant="caption" tone="muted" style={{ marginTop: 4 }}>
                  {aiSuggestion.description}
                </AppText>

                <Button
                  label="Áp dụng giá & số lượng này"
                  variant="primary"
                  size="sm"
                  onPress={handleApplyAiSuggestion}
                  style={{ marginTop: 8 }}
                />
              </View>
            ) : null}

            <View style={{ marginTop: spacing.md }}>
              <TextField
                label="Giá bán (VNĐ) *"
                value={priceStr}
                onChangeText={setPriceStr}
                placeholder="Ví dụ: 1450000"
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginTop: spacing.md }}>
              <TextField
                label="Số lượng tồn kho *"
                value={soluongStr}
                onChangeText={setSoluongStr}
                placeholder="Ví dụ: 25"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={isWebWide ? styles.columnRight : { marginTop: spacing.lg }}>
            <AppText variant="subheading" style={{ marginBottom: 8 }}>
              Hình ảnh sản phẩm *
            </AppText>

            {image ? (
              <View style={[styles.imagePreviewWrapper, { borderRadius: radius.md, backgroundColor: colors.surfaceAlt }]}>
                <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="contain" />
              </View>
            ) : (
              <View style={[styles.emptyImageWrapper, { borderRadius: radius.md, borderColor: colors.border }]}>
                <Ionicons name="image-outline" size={54} color={colors.textMuted} />
                <AppText variant="caption" tone="muted" style={{ marginTop: 6 }}>
                  Chưa có ảnh nào được chọn
                </AppText>
              </View>
            )}

            <View style={styles.imageButtonsRow}>
              <Button
                label="Chọn ảnh từ máy"
                variant="secondary"
                size="sm"
                onPress={() => handlePickImage('library')}
                style={{ flex: 1, marginRight: 8 }}
              />
              {Platform.OS !== 'web' ? (
                <Button
                  label="Chụp từ Camera"
                  variant="secondary"
                  size="sm"
                  onPress={() => handlePickImage('camera')}
                  style={{ flex: 1 }}
                />
              ) : null}
            </View>
          </View>
        </View>

        {formError ? (
          <AppText variant="caption" tone="danger" style={{ marginTop: spacing.md }}>
            {formError}
          </AppText>
        ) : null}

        <Button
          label={submitLabel}
          variant="primary"
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: spacing.xl }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 24,
  },
  columnLeft: {
    flex: 1.2,
  },
  columnRight: {
    flex: 1,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  aiBox: {
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
  },
  imagePreviewWrapper: {
    width: '100%',
    height: 240,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  emptyImageWrapper: {
    width: '100%',
    height: 240,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
