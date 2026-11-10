import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { MAX_BASE64_IMAGE_BYTES } from '@/core/config/appConfig';
import { AppError, toAppError } from '@/core/errors';

export type ImagePickSource = 'library' | 'camera';

export type PickImageOutcome =
  | { status: 'picked'; base64Uri: string }
  | { status: 'canceled' }
  | { status: 'permission-denied'; source: ImagePickSource };

function estimateByteLength(value: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
}

async function compressToBase64DataUri(
  uri: string,
  sourceWidth: number | undefined,
  maxWidth: number,
  compress: number,
): Promise<string> {
  let context = ImageManipulator.manipulate(uri);
  if (sourceWidth === undefined || sourceWidth > maxWidth) {
    context = context.resize({ width: maxWidth });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!saved.base64) {
    throw new AppError('storage', 'Không thể chuyển ảnh sang định dạng base64.');
  }

  return `data:image/jpeg;base64,${saved.base64}`;
}

export async function pickAndCompressImage(source: ImagePickSource): Promise<PickImageOutcome> {
  try {
    if (source === 'camera') {
      if (Platform.OS === 'web') {
        throw new AppError(
          'unsupported',
          'Chụp ảnh trực tiếp chỉ hỗ trợ trên điện thoại. Trên web hãy dùng nút Chọn ảnh.',
        );
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return { status: 'permission-denied', source: 'camera' };
      }
    } else if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return { status: 'permission-denied', source: 'library' };
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled) {
      return { status: 'canceled' };
    }

    const asset = result.assets[0];
    if (!asset) {
      return { status: 'canceled' };
    }

    let dataUri = await compressToBase64DataUri(asset.uri, asset.width, 520, 0.65);

    if (estimateByteLength(dataUri) > MAX_BASE64_IMAGE_BYTES) {
      dataUri = await compressToBase64DataUri(asset.uri, asset.width, 320, 0.45);
    }

    if (estimateByteLength(dataUri) > MAX_BASE64_IMAGE_BYTES) {
      throw new AppError(
        'validation',
        'Ảnh sau khi nén vẫn quá lớn (vượt giới hạn 1MB của Firestore). Vui lòng chọn ảnh nhẹ hơn.',
      );
    }

    return { status: 'picked', base64Uri: dataUri };
  } catch (error: unknown) {
    throw toAppError(error, 'storage');
  }
}