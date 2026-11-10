import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deleteApp, initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, terminate } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD7EEhCPxOmqM7JVDMHe8eDn59PKEWbVlo',
  authDomain: 'manager-admin-midterm.firebaseapp.com',
  projectId: 'manager-admin-midterm',
  storageBucket: 'manager-admin-midterm.firebasestorage.app',
  messagingSenderId: '1029144404071',
  appId: '1:1029144404071:web:8f9d8c01dfc3037847b4c2',
  measurementId: 'G-E2GPDSEZJL',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const jsonPath = path.join(rootDir, 'products.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Không tìm thấy file products.json!');
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Bắt đầu nạp ${items.length} sản phẩm vào collection "products"...`);

  try {
    for (const item of items) {
      // Đảm bảo chỉ gửi đúng 4 trường theo đề bài
      const payload = {
        name: String(item.name || '').trim(),
        price: Number(item.price) || 0,
        soluong: Math.floor(Number(item.soluong) || 0),
        image: String(item.image || '').trim(),
      };
      const ref = await addDoc(collection(db, 'products'), payload);
      console.log(`+ Đã thêm sản phẩm: "${payload.name}" (ID: ${ref.id})`);
    }
    console.log('✅ Nạp dữ liệu mẫu vào Firestore thành công!');
  } finally {
    await terminate(db);
    await deleteApp(app);
  }
}

main().catch((err) => {
  console.error('Lỗi khi nạp dữ liệu:', err);
  process.exit(1);
});