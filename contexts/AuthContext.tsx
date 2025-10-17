'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface User {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Create user object from Firebase user
        const userData: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')?.[0] || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || '',
          plan: 'free' // Default plan
        };

        // Save user to our database
        try {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: userData.uid,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar
            })
          });
        } catch (error) {
          console.error('Error saving user to database:', error);
        }

        // Fetch actual plan from backend (tokenUsage) to keep UI in sync
        try {
          const r = await fetch(`/api/user-plan?uid=${encodeURIComponent(userData.uid)}&t=${Date.now()}`, { cache: 'no-store' });
          const j = await r.json();
          if (r.ok && j?.plan) {
            userData.plan = j.plan;
          }
        } catch (e) {
          // noop; default 'free' remains if request fails
        }

        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Keep user.plan in sync on window focus/visibility
  useEffect(() => {
    let active = true;
    const syncPlan = async () => {
      if (!user?.uid) return;
      try {
        const r = await fetch(`/api/user-plan?uid=${encodeURIComponent(user.uid)}&t=${Date.now()}`, { cache: 'no-store' });
        const j = await r.json();
        if (active && r.ok && j?.plan && user) {
          setUser({ ...user, plan: j.plan });
        }
      } catch {}
    };
    const onFocus = () => syncPlan();
    const onVisibility = () => { if (document.visibilityState === 'visible') syncPlan(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user?.uid]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      // Provide helpful error message for configuration issues
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase configuration not found. Please check your .env.local file.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
