import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Attempt to fetch a non-existent document to test connection
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('[Firebase] Connection to Firestore verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Firestore connection failed: the client is offline. Check your configuration.');
    } else {
      // Other errors might be permission denied (which is fine for this test)
      console.log('[Firebase] Firestore connection test completed (ignoring non-offline errors).');
    }
  }
}

testConnection();

export default app;