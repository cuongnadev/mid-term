import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { ADMIN_EMAIL, USERS_COLLECTION } from '@/core/config/appConfig';
import { assertFirebaseConfigured, db } from '@/core/config/firebaseConfig';
import { AppError, toAppError } from '@/core/errors';
import {
  hashPassword,
  normalizeEmail,
  normalizeText,
  validateEmail,
  validateFullName,
  validatePassword,
  verifyPassword,
} from '@/core/utils';
import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UserFields,
  UserRecord,
} from './types';

function readStringField(data: DocumentData, key: keyof UserFields): string {
  const value: unknown = data[key];
  return typeof value === 'string' ? value : '';
}

function mapDocToUser(id: string, data: DocumentData): UserRecord {
  return {
    id,
    email: readStringField(data, 'email'),
    matkhau: readStringField(data, 'matkhau'),
    hoten: readStringField(data, 'hoten'),
    hinhanh: readStringField(data, 'hinhanh'),
  };
}

function toFirestorePayload(fields: UserFields): UserFields {
  return {
    email: fields.email,
    matkhau: fields.matkhau,
    hoten: fields.hoten,
    hinhanh: fields.hinhanh,
  };
}

function mapFirestoreError(error: unknown, fallbackMessage?: string): AppError {
  if (error instanceof AppError) return error;

  const code =
    error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';

  if (code === 'permission-denied') {
    return new AppError(
      'forbidden',
      'Firestore chưa cấp quyền truy cập. Kiểm tra lại Firestore Rules.',
      { cause: error },
    );
  }
  if (code === 'unavailable') {
    return new AppError(
      'network',
      'Không kết nối được tới Firestore. Kiểm tra mạng rồi thử lại.',
      { cause: error },
    );
  }
  if (code === 'not-found') {
    return new AppError('not_found', 'Không tìm thấy người dùng.', { cause: error });
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

function usersCollection() {
  assertFirebaseConfigured();
  return collection(db, USERS_COLLECTION);
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  try {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;

    const q = query(usersCollection(), where('email', '==', normalized), limit(1));
    const snapshot = await getDocs(q);
    const first = snapshot.docs[0];
    if (!first) return null;

    return mapDocToUser(first.id, first.data());
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không thể kiểm tra email trên Firestore.');
  }
}

export async function getUsers(): Promise<UserRecord[]> {
  try {
    const snapshot = await getDocs(usersCollection());
    const list = snapshot.docs.map((docSnap) => mapDocToUser(docSnap.id, docSnap.data()));
    return list.sort((a, b) => a.hoten.localeCompare(b.hoten, 'vi'));
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không tải được danh sách người dùng.');
  }
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const trimmedId = id.trim();
  if (!trimmedId) return null;

  if (trimmedId === 'admin_root_id') {
    const defaultHash = await hashPassword('123456');
    return {
      id: 'admin_root_id',
      email: ADMIN_EMAIL,
      matkhau: defaultHash,
      hoten: 'Quản trị viên Hệ thống',
      hinhanh: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
    };
  }

  try {
    assertFirebaseConfigured();
    const docRef = doc(db, USERS_COLLECTION, trimmedId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    return mapDocToUser(docSnap.id, docSnap.data());
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không tải được thông tin người dùng.');
  }
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  try {
    const emailError = validateEmail(input.email);
    if (emailError) throw new AppError('validation', emailError);

    const passwordError = validatePassword(input.matkhau, { required: true });
    if (passwordError) throw new AppError('validation', passwordError);

    const nameError = validateFullName(input.hoten);
    if (nameError) throw new AppError('validation', nameError);

    const email = normalizeEmail(input.email);
    const hoten = normalizeText(input.hoten);
    const hinhanh = input.hinhanh.trim();

    const existing = await findByEmail(email);
    if (existing) {
      throw new AppError('conflict', 'Email này đã được sử dụng.');
    }

    const hashedPassword = await hashPassword(input.matkhau);
    const payload = toFirestorePayload({
      email,
      matkhau: hashedPassword,
      hoten,
      hinhanh,
    });

    const createdRef = await addDoc(usersCollection(), payload);
    return {
      id: createdRef.id,
      ...payload,
    };
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không thể tạo người dùng mới.');
  }
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserRecord> {
  try {
    const trimmedId = id.trim();
    if (!trimmedId) {
      throw new AppError('validation', 'Thiếu mã người dùng.');
    }

    const nameError = validateFullName(input.hoten);
    if (nameError) throw new AppError('validation', nameError);

    const newPassword = input.matkhau ?? '';
    const passwordError = validatePassword(newPassword, { required: false });
    if (passwordError) throw new AppError('validation', passwordError);

    assertFirebaseConfigured();
    const docRef = doc(db, USERS_COLLECTION, trimmedId);
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      throw new AppError('not_found', 'Người dùng không còn tồn tại.');
    }

    const existing = mapDocToUser(existingSnap.id, existingSnap.data());
    const nextPasswordHash = newPassword ? await hashPassword(newPassword) : existing.matkhau;

    const payload = toFirestorePayload({
      email: existing.email,
      matkhau: nextPasswordHash,
      hoten: normalizeText(input.hoten),
      hinhanh: input.hinhanh.trim(),
    });

    await updateDoc(docRef, payload);

    return {
      id: existing.id,
      ...payload,
    };
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không thể cập nhật thông tin người dùng.');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    const trimmedId = id.trim();
    if (!trimmedId) {
      throw new AppError('validation', 'Thiếu mã người dùng.');
    }

    assertFirebaseConfigured();
    const docRef = doc(db, USERS_COLLECTION, trimmedId);
    await deleteDoc(docRef);
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không thể xoá người dùng.');
  }
}

export async function login(email: string, password: string): Promise<UserRecord> {
  const emailError = validateEmail(email);
  if (emailError) throw new AppError('validation', emailError);

  if (!password) {
    throw new AppError('validation', 'Vui lòng nhập mật khẩu.');
  }

  const normalized = normalizeEmail(email);

  // 1. Kiểm tra tài khoản Quản trị viên (Admin)
  if (normalized === ADMIN_EMAIL.trim().toLowerCase()) {
    // Thử tìm trên Firestore trước nếu đã có
    try {
      const existing = await findByEmail(normalized);
      if (existing) {
        const matched = await verifyPassword(password, existing.matkhau);
        if (matched) return existing;
      }
    } catch {
      // Bỏ qua lỗi Firestore nếu chưa cấu hình collection users
    }

    // Nếu mật khẩu khớp với mật khẩu mặc định 123456
    if (password === '123456') {
      const defaultHash = await hashPassword('123456');
      const adminRecord: UserRecord = {
        id: 'admin_root_id',
        email: ADMIN_EMAIL,
        matkhau: defaultHash,
        hoten: 'Quản trị viên Hệ thống',
        hinhanh: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
      };

      // Tự động tạo bản ghi lên Firestore nếu có quyền
      try {
        const payload = toFirestorePayload(adminRecord);
        const createdRef = await addDoc(usersCollection(), payload);
        adminRecord.id = createdRef.id;
      } catch {
        // Nếu Firestore chỉ cho phép products thì vẫn cho đăng nhập với admin tích hợp
      }

      return adminRecord;
    }

    throw new AppError('unauthorized', 'Mật khẩu Quản trị viên không đúng (Mặc định: 123456).');
  }

  // 2. Với các email khác (nếu có trên Firestore)
  try {
    const user = await findByEmail(normalized);
    if (!user) {
      throw new AppError('unauthorized', 'Email hoặc mật khẩu không đúng.');
    }

    const matched = await verifyPassword(password, user.matkhau);
    if (!matched) {
      throw new AppError('unauthorized', 'Email hoặc mật khẩu không đúng.');
    }

    return user;
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Đăng nhập thất bại. Vui lòng thử lại.');
  }
}

export async function changePassword(id: string, input: ChangePasswordInput): Promise<void> {
  try {
    const trimmedId = id.trim();
    if (!trimmedId) {
      throw new AppError('validation', 'Thiếu mã người dùng.');
    }

    if (!input.currentPassword) {
      throw new AppError('validation', 'Vui lòng nhập mật khẩu hiện tại.');
    }

    const newPasswordError = validatePassword(input.newPassword, { required: true });
    if (newPasswordError) throw new AppError('validation', newPasswordError);

    if (input.currentPassword === input.newPassword) {
      throw new AppError('validation', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    assertFirebaseConfigured();
    const docRef = doc(db, USERS_COLLECTION, trimmedId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new AppError('not_found', 'Không tìm thấy tài khoản.');
    }

    const existing = mapDocToUser(docSnap.id, docSnap.data());
    const matched = await verifyPassword(input.currentPassword, existing.matkhau);
    if (!matched) {
      throw new AppError('unauthorized', 'Mật khẩu hiện tại không đúng.');
    }

    const nextHash = await hashPassword(input.newPassword);
    await updateDoc(docRef, { matkhau: nextHash });
  } catch (error: unknown) {
    throw mapFirestoreError(error, 'Không thể đổi mật khẩu.');
  }
}