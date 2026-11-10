import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { AppError } from '@/core/errors';

const firebaseConfig = {
  apiKey: 'AIzaSyD7EEhCPxOmqM7JVDMHe8eDn59PKEWbVlo',
  authDomain: 'manager-admin-midterm.firebaseapp.com',
  projectId: 'manager-admin-midterm',
  storageBucket: 'manager-admin-midterm.firebasestorage.app',
  messagingSenderId: '1029144404071',
  appId: '1:1029144404071:web:8f9d8c01dfc3037847b4c2',
  measurementId: 'G-E2GPDSEZJL',
};

export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey.trim().length > 0 &&
    !firebaseConfig.apiKey.startsWith('YOUR_') &&
    firebaseConfig.projectId.trim().length > 0 &&
    !firebaseConfig.projectId.startsWith('YOUR_')
  );
}

export function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new AppError(
      'not_configured',
      'Chưa cấu hình Firebase. Hãy dán firebaseConfig thật vào src/core/config/firebaseConfig.ts.',
    );
  }
}

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createFirestoreInstance(firebaseApp: FirebaseApp): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

export const db: Firestore = createFirestoreInstance(app);
export { app };