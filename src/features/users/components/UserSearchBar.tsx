import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { IconButton, TextField } from '@/ui';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function UserSearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm theo họ tên hoặc email',
}: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <TextField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Tìm kiếm người dùng"
        rightSlot={
          value.length > 0 ? (
            <IconButton
              icon={<Ionicons name="close-circle" size={20} color={colors.textMuted} />}
              accessibilityLabel="Xoá nội dung tìm kiếm"
              onPress={() => onChangeText('')}
            />
          ) : undefined
        }
      />
    </View>
  );
}