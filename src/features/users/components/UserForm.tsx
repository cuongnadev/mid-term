import { useCallback, useRef, useState, type ComponentRef } from 'react';
import { Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePreventRemove } from 'expo-router';
import { MAX_NAME_LENGTH } from '@/core/utils';
import { useTheme } from '@/theme';
import { AppText, Button, Card, Dialog, IconButton, PageHeader, Screen, TextField } from '@/ui';
import { useUserForm } from '../hooks/useUserForm';
import type { UserRecord } from '../types';
import { ImageField } from './ImageField';
import { PasswordStrengthBar } from './PasswordStrengthBar';
import { PasswordSuggestButton } from './PasswordSuggestButton';

type Props = {
  user?: UserRecord;
  title?: string;
  subtitle?: string;
  onSaved: (saved: UserRecord) => void;
};

export function UserForm({ user, title, subtitle, onSaved }: Props) {
  const { colors, spacing } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const [bypassGuard, setBypassGuard] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleSaved = useCallback(
    (saved: UserRecord) => {
      setBypassGuard(true);
      setTimeout(() => onSaved(saved), 0);
    },
    [onSaved],
  );

  const form = useUserForm({ user, onSaved: handleSaved });

  usePreventRemove(form.dirty && !bypassGuard, ({ repeat }) => {
    setPendingLeave(() => repeat);
    setConfirmLeave(true);
  });

  const scrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const positions = useRef<Record<string, number>>({});
  const inputs = useRef<Record<string, ComponentRef<typeof TextInput> | null>>({});

  const handleSave = () => {
    const fieldErrors = form.save();
    const firstField = (['email', 'hoten', 'matkhau'] as const).find(
      (field) => fieldErrors[field],
    );
    if (!firstField) return;

    const y = positions.current[firstField] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    inputs.current[firstField]?.focus();
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const discardAndLeave = () => {
    setConfirmLeave(false);
    setBypassGuard(true);
    const repeat = pendingLeave;
    setPendingLeave(null);
    setTimeout(() => repeat?.(), 0);
  };

  const resolvedTitle = title ?? (form.isEdit ? 'Sửa người dùng' : 'Thêm người dùng');
  const resolvedSubtitle =
    subtitle ?? (user ? user.hoten || user.email : 'Nhập thông tin tài khoản mới');

  return (
    <Screen
      edges={['top', 'bottom']}
      scroll
      maxWidth={560}
      scrollRef={scrollRef}
      contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <PageHeader title={resolvedTitle} subtitle={resolvedSubtitle} showBack onBack={goBack} />

      <ImageField
        value={form.values.hinhanh}
        name={form.values.hoten || form.values.email}
        busy={form.imageBusy}
        error={form.imageError}
        onPick={form.pickImage}
        onRemove={form.removeImage}
      />

      <Card>
        <View style={{ gap: spacing.md }}>
          <View
            onLayout={(event) => {
              positions.current.email = event.nativeEvent.layout.y;
            }}
          >
            <TextField
              ref={(instance) => {
                inputs.current.email = instance;
              }}
              label="Email"
              required={!form.isEdit}
              disabled={form.isEdit}
              value={form.values.email}
              onChangeText={(text) => form.setField('email', text)}
              error={form.errors.email}
              hint={form.isEdit ? 'Email cố định, không thể chỉnh sửa.' : undefined}
              placeholder="nguoidung@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View
            onLayout={(event) => {
              positions.current.hoten = event.nativeEvent.layout.y;
            }}
          >
            <TextField
              ref={(instance) => {
                inputs.current.hoten = instance;
              }}
              label="Họ tên"
              required
              value={form.values.hoten}
              onChangeText={(text) => form.setField('hoten', text)}
              error={form.errors.hoten}
              placeholder="Nguyễn Văn A"
              maxLength={MAX_NAME_LENGTH}
              returnKeyType="next"
            />
          </View>

          <View
            style={{ gap: spacing.sm }}
            onLayout={(event) => {
              positions.current.matkhau = event.nativeEvent.layout.y;
            }}
          >
            <TextField
              ref={(instance) => {
                inputs.current.matkhau = instance;
              }}
              label={form.isEdit ? 'Mật khẩu mới' : 'Mật khẩu'}
              required={!form.isEdit}
              value={form.values.matkhau}
              onChangeText={(text) => form.setField('matkhau', text)}
              error={form.errors.matkhau}
              hint={
                form.isEdit
                  ? 'Để trống nếu muốn giữ nguyên mật khẩu cũ.'
                  : 'Mật khẩu tối thiểu 6 ký tự.'
              }
              placeholder={form.isEdit ? 'Nhập nếu muốn đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              rightSlot={
                <IconButton
                  icon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  }
                  accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              }
            />

            <PasswordStrengthBar
              password={form.values.matkhau}
              hideWhenEmpty={form.isEdit}
            />

            <PasswordSuggestButton
              disabled={form.saving}
              onSuggested={(suggested) => {
                form.setField('matkhau', suggested);
                setShowPassword(true);
              }}
            />
          </View>

          {form.saveError ? (
            <AppText variant="caption" tone="danger">
              {form.saveError.message}
            </AppText>
          ) : null}

          <Button
            label={form.isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}
            onPress={handleSave}
            loading={form.saving}
            disabled={form.imageBusy}
          />
        </View>
      </Card>

      <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Huỷ">
        <AppText variant="caption" tone="muted" align="center">
          Huỷ và quay lại
        </AppText>
      </Pressable>

      <Dialog
        visible={confirmLeave}
        title="Bỏ thay đổi?"
        message="Bạn đã nhập thông tin nhưng chưa lưu. Rời màn hình sẽ mất các thay đổi này."
        confirmLabel="Bỏ thay đổi"
        cancelLabel="Tiếp tục sửa"
        destructive
        onCancel={() => {
          setConfirmLeave(false);
          setPendingLeave(null);
        }}
        onConfirm={discardAndLeave}
      />

      <Dialog
        visible={form.permissionIssue !== null}
        title={form.permissionIssue === 'camera' ? 'Cần quyền camera' : 'Cần quyền thư viện ảnh'}
        message="Ứng dụng cần được cấp quyền để chọn hoặc chụp ảnh đại diện. Bạn có thể bật lại quyền trong Cài đặt."
        confirmLabel="Mở cài đặt"
        cancelLabel="Để sau"
        onCancel={form.dismissPermissionIssue}
        onConfirm={() => {
          form.dismissPermissionIssue();
          void Linking.openSettings();
        }}
      />
    </Screen>
  );
}