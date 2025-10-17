import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.replace(/\\n/g, '\n');

  try {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }) as admin.credential.Credential,
      });
      
    } else {
      // Use the same project ID as the client SDK
      const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      if (clientProjectId) {
        admin.initializeApp({
          projectId: clientProjectId
        });
        
      } else {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
        
      }
    }
    
    // Initialize database connection
    db = admin.firestore();
    
  } catch (e) {
    db = null;
  }
} else {
  // App already initialized, get the database
  try {
    db = admin.firestore();
    
  } catch (e) {
    db = null;
  }
}

// Ensure db is non-null at import time; fail fast if misconfigured
if (!db) {
  throw new Error('Firebase Admin initialization failed: Firestore db is null. Check service account env vars or credentials.');
}

const dbNonNull = db as admin.firestore.Firestore;

export { admin };
export { dbNonNull as db };


