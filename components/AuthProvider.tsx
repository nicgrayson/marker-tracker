"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getAuthInstance, getDb, isFirebaseConfigured } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  firebaseReady: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = isFirebaseConfigured;

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const auth = getAuthInstance();
    const db = getDb();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setDoc(
          doc(db, "users", currentUser.uid),
          {
            email: currentUser.email ?? "",
            displayName: currentUser.displayName ?? "",
            photoURL: currentUser.photoURL ?? "",
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true },
        ).catch(() => {});
      }
    });
    return unsubscribe;
  }, [firebaseReady]);

  const signIn = useCallback(async () => {
    const { GoogleAuthProvider } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAuthInstance(), provider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(getAuthInstance());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, firebaseReady, signIn, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}