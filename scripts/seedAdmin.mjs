import crypto from 'node:crypto';
import { deleteApp, initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore, limit, query, terminate, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD7EEhCPxOmqM7JVDMHe8eDn59PKEWbVlo',
  authDomain: 'manager-admin-midterm.firebaseapp.com',
  projectId: 'manager-admin-midterm',
  storageBucket: 'manager-admin-midterm.firebasestorage.app',
  messagingSenderId: '1029144404071',
  appId: '1:1029144404071:web:8f9d8c01dfc3037847b4c2',
  measurementId: 'G-E2GPDSEZJL',
};

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';
const PEPPER = 'midterm-react-native-user-pepper-2026';

function hashPassword(password) {
  const salted = `${PEPPER}:${password}:${PEPPER}`;
  return crypto.createHash('sha256').update(salted).digest('hex');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log(`Kiểm tra tài khoản Quản trị viên (${ADMIN_EMAIL}) trên Firestore...`);

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', ADMIN_EMAIL), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      console.log(`ℹ️ Tài khoản Admin đã tồn tại trên Firestore (ID: ${docSnap.id}).`);
      console.log(`- Email: ${ADMIN_EMAIL}`);
      console.log('- Bạn có thể đăng nhập ngay trên ứng dụng.');
      return;
    }

    console.log('Chưa có tài khoản Admin. Đang khởi tạo tự động...');
    const payload = {
      email: ADMIN_EMAIL,
      matkhau: hashPassword(ADMIN_PASSWORD),
      hoten: 'Quản trị viên Hệ thống',
      hinhanh: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
    };

    const docRef = await addDoc(usersRef, payload);
    console.log(`✅ Khởi tạo tài khoản Admin thành công (ID: ${docRef.id})!`);
    console.log(`- Email: ${ADMIN_EMAIL}`);
    console.log(`- Mật khẩu: ${ADMIN_PASSWORD}`);
    console.log('- Đăng nhập ngay trên giao diện Web hoặc Mobile.');
  } finally {
    await terminate(db);
    await deleteApp(app);
  }
}

main().catch((err) => {
  console.error('Lỗi khởi tạo tài khoản Admin:', err);
  process.exit(1);
});
