import { useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { toAppError } from '@/core/errors';
import { confirmDialog, validatePassword } from '@/core/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { usePreferences } from '@/features/preferences/PreferencesProvider';
import { AdminShell } from '@/features/products/components/AdminShell';
import { PasswordStrengthBar } from '@/features/users/components/PasswordStrengthBar';
import { PasswordSuggestButton } from '@/features/users/components/PasswordSuggestButton';
import { changePassword } from '@/features/users/userService';
import { useTheme, type ThemeMode } from '@/theme';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  ImageViewer,
  ListItem,
  TextField,
} from '@/ui';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
  { value: 'system', label: 'Hệ thống' },
];

export default function ProfileScreen() {
  const { colors, spacing, mode } = useTheme();
  const preferences = usePreferences();
  const auth = useAuth();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const [viewerOpen, setViewerOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const user = auth.user;
  if (!user) return null;

  const avatarUri = user.hinhanh.trim().length > 0 ? user.hinhanh : null;

  const handleChangePassword = async () => {
    if (changingPassword) return;

    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    const newErr = validatePassword(newPassword, { required: true });
    if (newErr) {
      setPasswordError(newErr);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(user.id, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess('Đổi mật khẩu thành công.');
    } catch (error: unknown) {
      setPasswordError(toAppError(error, 'storage').message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmDialog({
      title: 'Đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất khỏi tài khoản hiện tại?',
      confirmLabel: 'Đăng xuất',
      cancelLabel: 'Ở lại',
      destructive: true,
    });
    if (confirmed) {
      await auth.logout();
    }
  };

  return (
    <AdminShell
      title="Hồ sơ Quản trị viên"
      subtitle="Thông tin tài khoản Admin & Cấu hình hệ thống"
      showBack
      onBack={() => router.replace('/products' as any)}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.lg, maxWidth: 680, width: '100%', alignSelf: 'center', gap: spacing.lg }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Pressable
              onPress={() => setViewerOpen(true)}
              disabled={!avatarUri}
              accessibilityRole={avatarUri ? 'button' : undefined}
              accessibilityLabel={avatarUri ? 'Xem ảnh đại diện lớn' : 'Chưa có ảnh đại diện'}
            >
              <Avatar uri={user.hinhanh} name={user.hoten || user.email} size={76} rounded="full" />
            </Pressable>

            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <AppText variant="heading" numberOfLines={2}>
                {user.hoten || 'Quản trị viên'}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {user.email}
              </AppText>
              <Badge label="Admin" tone="primary" />
            </View>
          </View>
        </Card>

        <Card>
          <AppText variant="subheading" style={{ marginBottom: spacing.md }}>
            Đổi mật khẩu Quản trị
          </AppText>

          <View style={{ gap: spacing.md }}>
            <TextField
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setPasswordError(null);
              }}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
            />

            <TextField
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setPasswordError(null);
              }}
              placeholder="Tối thiểu 6 ký tự"
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              rightSlot={
                <PasswordSuggestButton
                  onSuggested={(pwd: string) => {
                    setNewPassword(pwd);
                    setConfirmNewPassword(pwd);
                    setPasswordError(null);
                  }}
                />
              }
            />

            <PasswordStrengthBar password={newPassword} />

            <TextField
              label="Xác nhận mật khẩu mới"
              value={confirmNewPassword}
              onChangeText={(text) => {
                setConfirmNewPassword(text);
                setPasswordError(null);
              }}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              rightSlot={
                <IconButton
                  icon={
                    <Ionicons
                      name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  }
                  accessibilityLabel={showPasswords ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onPress={() => setShowPasswords((prev) => !prev)}
                />
              }
            />

            {passwordError ? (
              <AppText variant="caption" tone="danger">
                {passwordError}
              </AppText>
            ) : null}

            {passwordSuccess ? (
              <AppText variant="caption" tone="success">
                {passwordSuccess}
              </AppText>
            ) : null}

            <Button
              label="Cập nhật mật khẩu"
              onPress={() => {
                void handleChangePassword();
              }}
              loading={changingPassword}
            />
          </View>
        </Card>

        <Card>
          <AppText variant="subheading" style={{ marginBottom: spacing.sm }}>
            Giao diện ứng dụng
          </AppText>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {THEME_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={mode === opt.value}
                onPress={() => preferences.setTheme(opt.value)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <AppText variant="subheading" style={{ marginBottom: spacing.xs }}>
            Thông tin phiên bản
          </AppText>
          <ListItem title="Phiên bản ứng dụng" subtitle={appVersion} />
          <Divider />
          <ListItem title="Nền tảng" subtitle={Platform.OS.toUpperCase()} />
          <Divider />
          <ListItem title="Hệ quản trị CSDL" subtitle="Firebase Firestore (collection: products)" />
        </Card>

        <Button label="Đăng xuất" variant="danger" onPress={() => void handleLogout()} />
      </ScrollView>

      {avatarUri ? (
        <ImageViewer
          visible={viewerOpen}
          uri={avatarUri}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}
    </AdminShell>
  );
}
