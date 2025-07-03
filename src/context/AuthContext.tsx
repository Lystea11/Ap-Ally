
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithRedirect, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChanged handles the result of signInWithRedirect automatically and is the single source of truth.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      // The redirect will happen, and onAuthStateChanged will handle the result on the return page.
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Firebase authentication failed", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/");
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
