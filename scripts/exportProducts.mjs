import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deleteApp, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, terminate } from 'firebase/firestore';

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
  console.log('Đang trích xuất dữ liệu collection "products" từ Firestore...');
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const products = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      products.push({
        name: String(data.name || '').trim(),
        price: Number(data.price || 0),
        soluong: Number(data.soluong || 0),
        image: String(data.image || '').trim(),
      });
    });

    const outPath = path.join(rootDir, 'products.json');
    fs.writeFileSync(outPath, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
    console.log(`✅ Đã xuất ${products.length} sản phẩm ra file: ${outPath}`);
  } finally {
    await terminate(db);
    await deleteApp(app);
  }
}

main().catch((err) => {
  console.error('Lỗi khi xuất CSDL:', err);
  process.exit(1);
});