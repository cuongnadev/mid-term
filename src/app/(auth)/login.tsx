import { useRef, useState, type ComponentRef } from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_EMAIL } from '@/core/config/appConfig';
import { toAppError } from '@/core/errors';
import { validateEmail } from '@/core/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/theme';
import { AppText, Button, Card, IconButton, Screen, TextField } from '@/ui';

export default function LoginScreen() {
  const { colors, spacing } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [matkhau, setMatkhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<ComponentRef<typeof TextInput> | null>(null);

  const handleQuickFillAdmin = () => {
    setEmail(ADMIN_EMAIL);
    setMatkhau('123456');
    setEmailError(null);
    setPasswordError(null);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const nextEmailErr = validateEmail(email);
    const nextPasswordErr = matkhau ? null : 'Vui lòng nhập mật khẩu.';

    setEmailError(nextEmailErr);
    setPasswordError(nextPasswordErr);
    setSubmitError(null);

    if (nextEmailErr || nextPasswordErr) return;

    setSubmitting(true);
    try {
      await login(email, matkhau);
    } catch (error: unknown) {
      setSubmitError(toAppError(error, 'unauthorized').message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      scroll
      maxWidth={460}
      contentContainerStyle={{
        justifyContent: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.xxl,
      }}
    >
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.xs,
          }}
        >
          <Ionicons name="cube-outline" size={36} color={colors.primary} />
        </View>
        <AppText variant="display" align="center">
          Administration
        </AppText>
        <AppText variant="body" tone="muted" align="center">
          Cổng Quản trị Kho hàng & Sản phẩm (Phân hệ Admin)
        </AppText>
      </View>

      <Card>
        <View style={{ gap: spacing.md }}>
          <TextField
            label="Email Quản trị viên"
            required
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(null);
              setSubmitError(null);
            }}
            error={emailError}
            placeholder="admin@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <TextField
            ref={passwordRef}
            label="Mật khẩu"
            required
            value={matkhau}
            onChangeText={(text) => {
              setMatkhau(text);
              setPasswordError(null);
              setSubmitError(null);
            }}
            error={passwordError}
            placeholder="Nhập mật khẩu quản trị"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => {
              void handleSubmit();
            }}
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

          {submitError ? (
            <AppText variant="caption" tone="danger">
              {submitError}
            </AppText>
          ) : null}

          <Button
            label="Đăng nhập Admin"
            onPress={() => {
              void handleSubmit();
            }}
            loading={submitting}
          />

          <Button
            label="⚡ Điền nhanh tài khoản Admin"
            variant="secondary"
            size="sm"
            onPress={handleQuickFillAdmin}
            disabled={submitting}
          />
        </View>
      </Card>

      <View style={{ gap: spacing.xs, alignItems: 'center' }}>
        <AppText variant="caption" tone="muted" align="center">
          Tài khoản Admin: {ADMIN_EMAIL} • Mật khẩu mặc định: 123456
        </AppText>
        <AppText variant="caption" tone="muted" align="center">
          (Hệ thống tự động khởi tạo tài khoản Admin trên Firestore khi đăng nhập lần đầu)
        </AppText>
      </View>
    </Screen>
  );
}
