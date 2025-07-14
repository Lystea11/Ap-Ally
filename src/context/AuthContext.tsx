"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, UserCredential, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = (): Promise<UserCredential> => {
    return signInWithPopup(auth, googleProvider).catch((error) => {
      console.error("Firebase authentication failed with popup:", error);
      throw error;
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // The redirect is now handled in the component that calls logout.
    } catch (error) {
      console.error("Firebase logout failed", error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
