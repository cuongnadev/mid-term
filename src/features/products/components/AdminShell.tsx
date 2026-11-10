import React, { type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { ADMIN_EMAIL } from '@/core/config/appConfig';
import { confirmDialog } from '@/core/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { usePreferences } from '@/features/preferences/PreferencesProvider';
import { useTheme } from '@/theme';
import { AppText, Badge, IconButton } from '@/ui';

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
};

export function AdminShell({
  title,
  subtitle,
  actions,
  showBack = false,
  onBack,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, spacing, radius, scheme, setMode } = useTheme();
  const preferences = usePreferences();
  const { logout } = useAuth();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width >= 860;

  const handleToggleTheme = (targetTheme: 'light' | 'dark') => {
    preferences.setTheme(targetTheme);
    setMode(targetTheme);
  };

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi phân hệ Quản trị?',
      confirmLabel: 'Đăng xuất',
      destructive: true,
    });
    if (ok) {
      await logout();
    }
  };

  const isProductsActive =
    pathname === '/products' ||
    (pathname.startsWith('/products/') && !pathname.startsWith('/products/new'));

  const isNewProductActive = pathname === '/products/new';
  const isProfileActive = pathname === '/profile';

  const navItems = [
    {
      id: 'products',
      label: 'Danh mục Sản phẩm',
      icon: 'cube-outline' as const,
      activeIcon: 'cube' as const,
      route: '/products',
      isActive: isProductsActive,
    },
    {
      id: 'new-product',
      label: 'Thêm sản phẩm mới',
      icon: 'add-circle-outline' as const,
      activeIcon: 'add-circle' as const,
      route: '/products/new',
      isActive: isNewProductActive,
    },
    {
      id: 'profile',
      label: 'Hồ sơ Quản trị',
      icon: 'person-circle-outline' as const,
      activeIcon: 'person-circle' as const,
      route: '/profile',
      isActive: isProfileActive,
    },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: colors.background }]}>
      {isDesktop ? (
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
            },
          ]}
        >
          <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
            <View
              style={[
                styles.brandLogo,
                { backgroundColor: colors.primarySoft, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="storefront" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subheading" style={{ fontWeight: '800' }}>
                Administration
              </AppText>
              <AppText variant="caption" tone="muted">
                Admin Console
              </AppText>
            </View>
            <Badge label="v1.0" tone="primary" />
          </View>

          <View style={styles.sidebarNav}>
            <AppText
              variant="caption"
              tone="muted"
              style={[styles.navSectionTitle, { paddingHorizontal: spacing.sm }]}
            >
              QUẢN LÝ KHO HÀNG
            </AppText>

            {navItems.map((item) => {
              const active = item.isActive;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(item.route as any)}
                  style={[
                    styles.navItem,
                    { borderRadius: radius.md },
                    active && {
                      backgroundColor: colors.primarySoft,
                      borderLeftWidth: 4,
                      borderLeftColor: colors.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? item.activeIcon : item.icon}
                    size={20}
                    color={active ? colors.primary : colors.textMuted}
                  />
                  <AppText
                    variant="bodyStrong"
                    style={{
                      marginLeft: spacing.sm,
                      color: active ? colors.primary : colors.text,
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
            <View
              style={[
                styles.themeSwitcher,
                { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill },
              ]}
            >
              <Pressable
                onPress={() => handleToggleTheme('light')}
                style={[
                  styles.themeTab,
                  scheme === 'light' && {
                    backgroundColor: colors.surface,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="sunny"
                  size={16}
                  color={scheme === 'light' ? colors.primary : colors.textMuted}
                />
                <AppText
                  variant="caption"
                  style={{
                    marginLeft: 6,
                    fontWeight: scheme === 'light' ? '700' : '500',
                    color: scheme === 'light' ? colors.primary : colors.textMuted,
                  }}
                >
                  Sáng
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => handleToggleTheme('dark')}
                style={[
                  styles.themeTab,
                  scheme === 'dark' && {
                    backgroundColor: colors.surface,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="moon"
                  size={16}
                  color={scheme === 'dark' ? colors.primary : colors.textMuted}
                />
                <AppText
                  variant="caption"
                  style={{
                    marginLeft: 6,
                    fontWeight: scheme === 'dark' ? '700' : '500',
                    color: scheme === 'dark' ? colors.primary : colors.textMuted,
                  }}
                >
                  Tối
                </AppText>
              </Pressable>
            </View>

            <View style={styles.adminSnippet}>
              <View
                style={[
                  styles.avatarMini,
                  { backgroundColor: colors.primary, borderRadius: radius.pill },
                ]}
              >
                <AppText variant="caption" style={{ color: colors.onPrimary, fontWeight: '800' }}>
                  AD
                </AppText>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }} numberOfLines={1}>
                  Quản trị viên
                </AppText>
                <AppText variant="caption" tone="muted" numberOfLines={1}>
                  {ADMIN_EMAIL}
                </AppText>
              </View>
              <IconButton
                icon={<Ionicons name="log-out-outline" size={20} color={colors.danger} />}
                accessibilityLabel="Đăng xuất"
                onPress={handleLogout}
              />
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.mainContainer}>
        <View
          style={[
            styles.topNavbar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.navLeft}>
            {showBack ? (
              <IconButton
                icon={<Ionicons name="arrow-back" size={22} color={colors.text} />}
                accessibilityLabel="Quay lại"
                onPress={onBack ? onBack : () => router.back()}
                style={{ marginRight: spacing.xs }}
              />
            ) : null}

            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="heading" numberOfLines={1} style={{ fontWeight: '800' }}>
                {title}
              </AppText>
              {subtitle ? (
                <AppText variant="caption" tone="muted" numberOfLines={1}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={styles.navRight}>
            {!isDesktop ? (
              <IconButton
                icon={
                  <Ionicons
                    name={scheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
                    size={22}
                    color={colors.text}
                  />
                }
                accessibilityLabel="Đổi giao diện Sáng/Tối"
                onPress={() => handleToggleTheme(scheme === 'dark' ? 'light' : 'dark')}
              />
            ) : null}

            {actions}
          </View>
        </View>

        <View style={styles.pageBody}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  sidebar: {
    width: 260,
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandLogo: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarNav: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 4,
  },
  navSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  sidebarFooter: {
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  themeSwitcher: {
    flexDirection: 'row',
    padding: 3,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  adminSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 8,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 4,
  },
  pageBody: {
    flex: 1,
  },
});
