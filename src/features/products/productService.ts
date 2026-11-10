import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { PRODUCTS_COLLECTION } from '@/core/config/appConfig';
import { assertFirebaseConfigured, db } from '@/core/config/firebaseConfig';
import { AppError, toAppError } from '@/core/errors';
import type {
  CreateProductInput,
  ProductFields,
  ProductRecord,
  UpdateProductInput,
} from './types';

function readStringField(data: DocumentData, key: keyof ProductFields): string {
  const value: unknown = data[key];
  return typeof value === 'string' ? value : '';
}

function readNumberField(data: DocumentData, key: keyof ProductFields): number {
  const value: unknown = data[key];
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function mapDocToProduct(id: string, data: DocumentData): ProductRecord {
  return {
    id,
    name: readStringField(data, 'name'),
    price: readNumberField(data, 'price'),
    soluong: readNumberField(data, 'soluong'),
    image: readStringField(data, 'image'),
  };
}

function toFirestorePayload(fields: ProductFields): ProductFields {
  return {
    name: fields.name.trim(),
    price: Math.max(0, Number(fields.price) || 0),
    soluong: Math.max(0, Math.floor(Number(fields.soluong) || 0)),
    image: fields.image.trim(),
  };
}

function mapFirestoreError(error: unknown, fallbackMessage?: string): AppError {
  if (error instanceof AppError) return error;

  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';

  if (code === 'permission-denied') {
    return new AppError('forbidden', 'Firestore chưa cấp quyền truy cập. Kiểm tra lại Firestore Rules.', {
      cause: error,
    });
  }
  if (code === 'unavailable') {
    return new AppError('network', 'Không kết nối được tới Firestore. Kiểm tra mạng rồi thử lại.', {
      cause: error,
    });
  }
  if (code === 'not-found') {
    return new AppError('not_found', 'Không tìm thấy sản phẩm.', { cause: error });
  }

  const mapped = toAppError(error, 'storage');
  if (fallbackMessage && mapped.code === 'storage') {
    return new AppError('storage', fallbackMessage, {
      cause: error,
      debugMessage: mapped.debugMessage,
    });
  }
  return mapped;
}

function productsCollection() {
  assertFirebaseConfigured();
  return collection(db, PRODUCTS_COLLECTION);
}

export function validateProductInput(fields: Partial<ProductFields>): void {
  const name = (fields.name ?? '').trim();
  if (!name) {
    throw new AppError('validation', 'Tên sản phẩm không được để trống.');
  }
  if (name.length < 2) {
    throw new AppError('validation', 'Tên sản phẩm phải có ít nhất 2 ký tự.');
  }

  const price = Number(fields.price);
  if (fields.price === undefined || Number.isNaN(price) || price < 0) {
    throw new AppError('validation', 'Giá sản phẩm phải là một số lớn hơn hoặc bằng 0.');
  }

  const soluong = Number(fields.soluong);
  if (fields.soluong === undefined || Number.isNaN(soluong) || soluong < 0) {
    throw new AppError('validation', 'Số lượng sản phẩm phải là một số nguyên không âm.');
  }

  const image = (fields.image ?? '').trim();
  if (!image) {
    throw new AppError('validation', 'Vui lòng chọn hoặc chụp hình ảnh cho sản phẩm.');
  }
}

export async function getProducts(): Promise<ProductRecord[]> {
  try {
    const q = query(productsCollection());
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => mapDocToProduct(docSnap.id, docSnap.data()));
  } catch (error) {
    throw mapFirestoreError(error, 'Không tải được danh sách sản phẩm.');
  }
}

export async function getProductById(id: string): Promise<ProductRecord> {
  try {
    assertFirebaseConfigured();
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new AppError('not_found', 'Sản phẩm không tồn tại hoặc đã bị xóa.');
    }
    return mapDocToProduct(snap.id, snap.data());
  } catch (error) {
    throw mapFirestoreError(error, 'Không tải được thông tin chi tiết sản phẩm.');
  }
}

export async function createProduct(input: CreateProductInput): Promise<ProductRecord> {
  validateProductInput(input);
  try {
    const payload = toFirestorePayload(input);
    const docRef = await addDoc(productsCollection(), payload);
    return {
      id: docRef.id,
      ...payload,
    };
  } catch (error) {
    throw mapFirestoreError(error, 'Không thể tạo mới sản phẩm.');
  }
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<ProductRecord> {
  validateProductInput(input);
  try {
    assertFirebaseConfigured();
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new AppError('not_found', 'Sản phẩm cần sửa không tồn tại.');
    }

    const payload = toFirestorePayload(input);
    await updateDoc(docRef, payload);

    return {
      id,
      ...payload,
    };
  } catch (error) {
    throw mapFirestoreError(error, 'Không thể cập nhật sản phẩm.');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    assertFirebaseConfigured();
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    throw mapFirestoreError(error, 'Không thể xóa sản phẩm.');
  }
}

export function exportProductsToJsonString(products: ProductRecord[]): string {
  const cleanData: ProductFields[] = products.map((p) => ({
    name: p.name,
    price: p.price,
    soluong: p.soluong,
    image: p.image,
  }));
  return JSON.stringify(cleanData, null, 2);
}