import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { IconButton } from './IconButton';

type Props = {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
  accessibilityLabel?: string;
};

export function ImageViewer({ visible, uri, onClose, accessibilityLabel = 'Ảnh sản phẩm' }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.overlay }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Đóng ảnh"
        />

        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel={accessibilityLabel}
          transition={150}
        />

        <View style={[styles.close, { top: insets.top + 8 }]}>
          <IconButton
            icon={<Ionicons name="close" size={24} color={colors.text} />}
            accessibilityLabel="Đóng ảnh"
            variant="soft"
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  image: { width: '100%', height: '80%' },
  close: { position: 'absolute', right: 12 },
});
