import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD-64G4IX_Sx4qS1knWzFARBP-mYkb0qDI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'finture-70303.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'finture-70303',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'finture-70303.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '896472690968',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:896472690968:web:d3c3c0f2769e3cf791ae6d',
}

export function isFirebaseConfigured(): boolean {
  return true
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  db = getFirestore(app)
} catch (err) {
  console.warn('Firebase DB init warning:', err)
}

export { app, db }

export function emailToUserId(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
}
