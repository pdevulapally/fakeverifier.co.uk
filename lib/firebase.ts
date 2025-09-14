// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where, orderBy, limit, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes ? getAnalytics(app) : null).then(analyticsInstance => {
    analytics = analyticsInstance;
  });
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Initialize Firebase Cloud Messaging
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging not supported:', error);
  }
}

// Authentication functions
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Verification data storage functions
export interface VerificationData {
  id: string;
  userId: string;
  title: string;
  content: string;
  verdict: "real" | "likely-real" | "likely-fake" | "fake" | "questionable" | "ai-generated";
  score: number;
  timestamp: Date;
  // AI Analysis data
  aiAnalysis?: {
    analysis: string;
    model: string;
    timestamp: string;
    newsData?: Array<{
      title: string;
      source: string;
      url: string;
      publishedAt: string;
      description: string;
      api: string;
    }>;
    structuredData?: {
      confidence: number;
      sources: string[];
      explanation: string;
      redFlags: string[];
      recommendations: string[];
      currentContext: string[];
      realTimeSources: string[];
      aiDetection?: string[];
    };
  };
  // Analysis data
  analysis?: {
    credibilityScore: number;
    sources: string[];
    reasoning: string[];
    evidenceMap?: {
      sources: Array<{
        name: string;
        trustRating: number;
        connections: string[];
      }>;
    };
    biasAnalysis?: {
      rating: "low" | "moderate" | "high";
      explanation: string;
    };
    timeline?: Array<{
      date: string;
      event: string;
      source: string;
    }>;
    deepfakeDetection?: {
      suspicious: boolean;
      timestamps: number[];
    };
    socialHeatmap?: {
      trending: boolean;
      platforms: string[];
      regions: string[];
    };
    multilingualSources?: string[];
    historicalCredibility?: {
      pastAccuracy: number;
      totalChecks: number;
    };
  };
  // Additional metadata
  urlsAnalyzed?: string[];
  detectedContent?: {
    links: string[];
    videoLinks: string[];
    images: string[];
    documents: string[];
  };
}

// Helper function to remove undefined values from objects
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== null);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeUndefinedValues(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
}

// Save verification data to Firestore
export const saveVerificationData = async (verificationData: VerificationData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Clean the data by removing undefined values
    const cleanedData = removeUndefinedValues(verificationData);

    const verificationWithUser = {
      ...cleanedData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'verifications'), verificationWithUser);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error saving verification data:', error);
    return { success: false, error: error.message };
  }
};

// Get verification history for current user
export const getVerificationHistory = async (limitCount: number = 50) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const q = query(
      collection(db, 'verifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    
    const verifications: VerificationData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Destructure data to exclude any 'id' field that might be in the document
      const { id: dataId, ...dataWithoutId } = data;
      
      verifications.push({
        id: doc.id, // Always use the Firestore document ID
        ...dataWithoutId, // Spread the rest of the data without the id field
        timestamp: data.createdAt?.toDate() || new Date(),
      } as VerificationData);
    });
    return { success: true, data: verifications };
  } catch (error: any) {
    console.error('Error getting verification history:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Delete verification data
export const deleteVerificationData = async (verificationId: string) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, let's check if the document exists and belongs to the user
    const docRef = doc(db, 'verifications', verificationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: true };
    }
    
    const data = docSnap.data();
    
    if (data.userId !== user.uid) {
      return { success: false, error: 'Access denied - document does not belong to current user' };
    }

    // Try to delete the document directly
    await deleteDoc(docRef);
    
    // Verify the deletion was successful
    const verifySnap = await getDoc(docRef);
    if (verifySnap.exists()) {
      return { success: false, error: 'Document still exists after deletion' };
    }
    return { success: true };
  } catch (error: any) {
    const user = getCurrentUser();
    console.error('Error deleting verification data:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      verificationId,
      userId: user?.uid || 'unknown'
    });
    
    // If the document doesn't exist, consider it a successful deletion
    if (error.code === 'not-found') {
      return { success: true };
    }
    
    return { success: false, error: error.message };
  }
};

// Update verification data
export const updateVerificationData = async (verificationId: string, updates: Partial<VerificationData>) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update the document directly
    // Firestore security rules will handle the permission check
    await updateDoc(doc(db, 'verifications', verificationId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating verification data:', error);
    return { success: false, error: error.message };
  }
};

// Get verification by ID
export const getVerificationById = async (verificationId: string) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the document directly by ID
    const docRef = doc(db, 'verifications', verificationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Verification not found' };
    }

    const data = docSnap.data();
    
    // Check if the user owns this document
    if (data.userId !== user.uid) {
      return { success: false, error: 'Access denied' };
    }

    const verification: VerificationData = {
      id: docSnap.id,
      ...data,
      timestamp: data.createdAt?.toDate() || new Date(),
    } as VerificationData;

    return { success: true, data: verification };
  } catch (error: any) {
    console.error('Error getting verification by ID:', error);
    return { success: false, error: error.message };
  }
};

// Token Management Functions
export interface TokenUsage {
  userId: string
  used: number
  total: number
  resetDate: Date
  plan: "free" | "pro" | "enterprise"
  lastUpdated: Date
  // Daily tracking for free users
  dailyUsed: number
  dailyResetDate: Date
}

export const getUserTokenUsage = async () => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const q = query(
      collection(db, 'tokenUsage'),
      where('userId', '==', user.uid),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // Create default token usage for new user
      const now = new Date()
      // Calculate next midnight for daily reset
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const defaultUsage: TokenUsage = {
        userId: user.uid,
        used: 0,
        total: 50, // Free tier: 50 tokens per month
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        plan: "free",
        lastUpdated: now,
        dailyUsed: 0,
        dailyResetDate: tomorrow // Reset at midnight
      }
      
      const docRef = await addDoc(collection(db, 'tokenUsage'), defaultUsage)
      return { success: true, data: { id: docRef.id, ...defaultUsage } }
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    
    // Convert Firestore Timestamps to JavaScript Date objects
    const tokenUsage: TokenUsage = {
      ...data,
      resetDate: data.resetDate?.toDate ? data.resetDate.toDate() : new Date(data.resetDate),
      lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(data.lastUpdated),
             dailyResetDate: data.dailyResetDate?.toDate ? data.dailyResetDate.toDate() : new Date(data.dailyResetDate || (() => {
         const tomorrow = new Date()
         tomorrow.setDate(tomorrow.getDate() + 1)
         tomorrow.setHours(0, 0, 0, 0)
         return tomorrow.getTime()
       })()),
      dailyUsed: data.dailyUsed || 0
    } as TokenUsage
    
    const now = new Date()
    
    // Check if monthly reset date has passed
    if (tokenUsage.resetDate < now) {
      // Reset monthly tokens
      const updatedUsage = {
        ...tokenUsage,
        used: 0,
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        lastUpdated: now
      }
      
      await updateDoc(doc.ref, updatedUsage)
      return { success: true, data: { id: doc.id, ...updatedUsage } }
    }
    
    // Check if daily reset date has passed (for free users) - reset at midnight
    if (tokenUsage.plan === "free" && tokenUsage.dailyResetDate < now) {
      // Calculate next midnight
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      // Reset daily tokens
      const updatedUsage = {
        ...tokenUsage,
        dailyUsed: 0,
        dailyResetDate: tomorrow,
        lastUpdated: now
      }
      
      await updateDoc(doc.ref, updatedUsage)
      return { success: true, data: { id: doc.id, ...updatedUsage } }
    }

    return { success: true, data: { id: doc.id, ...tokenUsage } }
  } catch (error: any) {
    console.error('Error getting user token usage:', error)
    return { success: false, error: error.message }
  }
}

export const consumeTokens = async (amount: number = 1) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const usageResult = await getUserTokenUsage()
    if (!usageResult.success) {
      throw new Error(usageResult.error)
    }

    const usage = usageResult.data as TokenUsage & { id: string }
    
    // Check monthly limit
    if (usage.used + amount > usage.total) {
      throw new Error('Monthly token limit exceeded')
    }
    
    // Check daily limit for free users (5 tokens per day, consuming from monthly allocation)
    if (usage.plan === "free" && usage.dailyUsed + amount > 5) {
      throw new Error('Daily limit reached! You can use 5 tokens per day from your monthly allocation. Reset at midnight.')
    }

    const updatedUsage = {
      ...usage,
      used: usage.used + amount, // This consumes from monthly tokens
      dailyUsed: usage.plan === "free" ? usage.dailyUsed + amount : usage.dailyUsed, // Track daily usage
      lastUpdated: new Date()
    }

    await updateDoc(doc(db, 'tokenUsage', usage.id), updatedUsage)
    return { success: true, data: updatedUsage }
  } catch (error: any) {
    console.error('Error consuming tokens:', error)
    return { success: false, error: error.message }
  }
}

export const upgradeUserPlan = async (plan: "free" | "pro" | "enterprise") => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const usageResult = await getUserTokenUsage()
    if (!usageResult.success) {
      throw new Error(usageResult.error)
    }

    const usage = usageResult.data as TokenUsage & { id: string }
    const newTotal = plan === "free" ? 50 : plan === "pro" ? 500 : 5000

    const updatedUsage = {
      ...usage,
      plan,
      total: newTotal,
      lastUpdated: new Date()
    }

    await updateDoc(doc(db, 'tokenUsage', usage.id), updatedUsage)
    return { success: true, data: updatedUsage }
  } catch (error: any) {
    console.error('Error upgrading user plan:', error)
    return { success: false, error: error.message }
  }
}

export const downgradeUserPlan = async (targetPlan: "free" | "pro" = "free") => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const usageResult = await getUserTokenUsage()
    if (!usageResult.success) {
      throw new Error(usageResult.error)
    }

    const usage = usageResult.data as TokenUsage & { id: string }
    
    // Only allow downgrade if user is currently on a higher plan
    if (usage.plan === 'free') {
      throw new Error('User is already on free plan')
    }
    
    if (usage.plan === 'pro' && targetPlan === 'pro') {
      throw new Error('User is already on pro plan')
    }

    const newTotal = targetPlan === "pro" ? 500 : 50

    const updatedUsage = {
      ...usage,
      plan: targetPlan,
      total: newTotal,
      lastUpdated: new Date()
    }

    await updateDoc(doc(db, 'tokenUsage', usage.id), updatedUsage)
    return { success: true, data: updatedUsage }
  } catch (error: any) {
    console.error('Error downgrading user plan:', error)
    return { success: false, error: error.message }
  }
}

export const getUserStripeSubscription = async () => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the user's ID token for server-side verification
    const idToken = await user.getIdToken()
    
    const response = await fetch('/api/get-subscription', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch subscription')
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting user subscription:', error)
    return { success: false, error: error.message }
  }
}

export const changeSubscription = async (targetPlan: "free" | "pro" | "enterprise", paymentFrequency: "monthly" | "yearly" = "monthly") => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the user's ID token for server-side verification
    const idToken = await user.getIdToken()
    
    const response = await fetch('/api/change-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        targetPlan,
        paymentFrequency,
        userId: user.uid,
        userEmail: user.email,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to change subscription')
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error: any) {
    console.error('Error changing subscription:', error)
    return { success: false, error: error.message }
  }
}

// Function to manually update user plan (for admin/debugging purposes)
export const updateUserPlanManually = async (userId: string, plan: "free" | "pro" | "enterprise") => {
  try {
    const newTotal = plan === "free" ? 50 : plan === "pro" ? 500 : 5000

    // Query the user's token usage document
    const q = query(
      collection(db, 'tokenUsage'),
      where('userId', '==', userId),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // Create new token usage document if it doesn't exist
      const now = new Date()
      // Calculate next midnight for daily reset
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const defaultUsage: TokenUsage = {
        userId: userId,
        used: 0,
        total: newTotal,
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        plan: plan,
        lastUpdated: now,
        dailyUsed: 0,
        dailyResetDate: tomorrow
      }
      
      const docRef = await addDoc(collection(db, 'tokenUsage'), defaultUsage)
      return { success: true, data: { id: docRef.id, ...defaultUsage } }
    }

    const doc = querySnapshot.docs[0]
    const updatedUsage = {
      plan,
      total: newTotal,
      lastUpdated: new Date()
    }

    await updateDoc(doc.ref, updatedUsage)
    return { success: true, data: { id: doc.id, ...doc.data(), ...updatedUsage } }
  } catch (error: any) {
    console.error('Error manually updating user plan:', error)
    return { success: false, error: error.message }
  }
}

// Notification functions
export interface NotificationPreferences {
  userId: string;
  breakingNews: boolean;
  categoryAlerts: string[];
  frequency: 'immediate' | 'hourly' | 'daily';
  enabled: boolean;
  lastUpdated: Date;
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    if (!messaging) {
      return { success: false, error: 'Messaging not supported' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (!token) {
      return { success: false, error: 'Failed to get token' };
    }

    return { success: true, token };
  } catch (error: any) {
    console.error('Error requesting notification permission:', error);
    return { success: false, error: error.message };
  }
};

// Save FCM token to Firestore
export const saveFCMToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const tokenData = {
      userId: user.uid,
      token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true
    };

    // Check if token already exists
    const q = query(
      collection(db, 'fcmTokens'),
      where('userId', '==', user.uid),
      where('token', '==', token)
    );
    
    const existingTokens = await getDocs(q);
    
    if (existingTokens.empty) {
      await addDoc(collection(db, 'fcmTokens'), tokenData);
    } else {
      // Update existing token
      const docRef = existingTokens.docs[0].ref;
      await updateDoc(docRef, {
        updatedAt: serverTimestamp(),
        active: true
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    return { success: false, error: error.message };
  }
};

// Get user's notification preferences
export const getNotificationPreferences = async (): Promise<{ success: boolean; data?: NotificationPreferences; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const q = query(
      collection(db, 'notificationPreferences'),
      where('userId', '==', user.uid),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Create default preferences
      const defaultPreferences: NotificationPreferences = {
        userId: user.uid,
        breakingNews: true,
        categoryAlerts: ['politics', 'world', 'technology'],
        frequency: 'immediate',
        enabled: true,
        lastUpdated: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'notificationPreferences'), defaultPreferences);
      return { success: true, data: defaultPreferences };
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const preferences: NotificationPreferences = {
      ...data,
      lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(data.lastUpdated)
    } as NotificationPreferences;

    return { success: true, data: preferences };
  } catch (error: any) {
    console.error('Error getting notification preferences:', error);
    return { success: false, error: error.message };
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const q = query(
      collection(db, 'notificationPreferences'),
      where('userId', '==', user.uid),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'Preferences not found' };
    }

    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      ...preferences,
      lastUpdated: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) {
    console.warn('Messaging not available');
    return () => {};
  }

  return onMessage(messaging, callback);
};

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator && 
         messaging !== null;
};

// Get notification permission status
export const getNotificationPermissionStatus = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

export { auth, app, analytics, db, messaging };
