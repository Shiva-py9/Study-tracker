import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

axios.defaults.withCredentials = true;

interface User {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  examDate?: string;
  settings?: any;
  isOnboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  onboardingComplete: boolean;
  login: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  completeOnboarding: (data: any) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] Setting up onAuthStateChanged listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      
      if (firebaseUser) {
        setIsGuest(false);
        // Fetch user data from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            setOnboardingComplete(!!userData.isOnboardingComplete);
            console.log('[AuthContext] User data loaded from Firestore:', userData);
          } else {
            // User exists in Auth but not in Firestore (shouldn't happen often)
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              isOnboardingComplete: false
            };
            setUser(newUser);
            setOnboardingComplete(false);
            console.log('[AuthContext] User document not found, using Auth data');
          }
        } catch (err) {
          console.error('[AuthContext] Error fetching user doc:', err);
          // Fallback to basic auth data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            isOnboardingComplete: false
          });
        }
      } else {
        // No user logged in, check for guest mode
        const guestMode = localStorage.getItem('shiva_guest_mode') === 'true';
        if (guestMode) {
          console.log('[AuthContext] Restoring guest mode');
          setIsGuest(true);
          setUser(null);
          setOnboardingComplete(localStorage.getItem('onboarding_complete') === 'true');
        } else {
          setUser(null);
          setIsGuest(false);
          setOnboardingComplete(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkAuth = async () => {
    // With Firebase, onAuthStateChanged handles this, but we can keep it for manual triggers
    setLoading(true);
    // The useEffect listener will handle the state update
    setLoading(false);
  };

  const login = () => {
    loginWithGoogle();
  };

  const loginWithGoogle = async () => {
    console.log('[AuthContext] Attempting Google login...');
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          isOnboardingComplete: false
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
        setOnboardingComplete(false);
      } else {
        const userData = userDoc.data() as User;
        setUser(userData);
        setOnboardingComplete(!!userData.isOnboardingComplete);
      }
      
      toast.success('Logged in with Google');
    } catch (err: any) {
      console.error('[AuthContext] Google login error:', err.message);
      toast.error(err.message || 'Google login failed');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    console.log('[AuthContext] Attempting Firebase login for:', email);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('Logged in successfully');
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err.code, err.message);
      let message = 'Login failed';
      if (err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. If you signed up with Google, please use Google login.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      }
      toast.error(message);
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    console.log('[AuthContext] Attempting Firebase signup for:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // Update profile with name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name,
        isOnboardingComplete: false
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      setUser(newUser);
      setIsGuest(false);
      setOnboardingComplete(false);
      toast.success('Account created successfully');
    } catch (err: any) {
      console.error('[AuthContext] Signup error:', err.message);
      toast.error(err.message || 'Signup failed');
      throw err;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('shiva_guest_mode', 'true');
    setOnboardingComplete(localStorage.getItem('onboarding_complete') === 'true');
    setUser(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('shiva_guest_mode');
      localStorage.removeItem('onboarding_complete');
      localStorage.removeItem('guest_onboarding_data');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
      toast.error('Logout failed');
    }
  };

  const completeOnboarding = async (data: any) => {
    console.log('[AuthContext] Completing onboarding with data:', data);
    try {
      if (isGuest) {
        localStorage.setItem('onboarding_complete', 'true');
        localStorage.setItem('guest_onboarding_data', JSON.stringify(data));
        setOnboardingComplete(true);
      } else if (auth.currentUser && user) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        
        // Ensure we include required fields in case the document doesn't exist or is incomplete
        const updateData = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || user.email,
          name: user.name || auth.currentUser.displayName || 'User',
          isOnboardingComplete: true,
          onboardingData: data,
          examDate: data.examDate || '2026-04-15',
          lastActive: new Date().toISOString()
        };

        try {
          await setDoc(userDocRef, updateData, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
        }
        
        setOnboardingComplete(true);
        setUser(prev => prev ? { ...prev, ...updateData } : null);
      }
      toast.success('Onboarding complete!');
    } catch (err: any) {
      console.error('[AuthContext] Onboarding completion error:', err.message);
      // If it's already a JSON error from handleFirestoreError, we just rethrow it
      // otherwise we wrap it
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isGuest, 
      onboardingComplete,
      loginWithEmail,
      signupWithEmail,
      continueAsGuest,
      completeOnboarding,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
