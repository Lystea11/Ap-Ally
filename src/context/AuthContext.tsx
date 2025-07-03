
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        // onAuthStateChanged will handle setting the user and loading state
      } else {
        // If there's no redirect result, we might still be loading the initial state
        // onAuthStateChanged will handle this.
      }
    })
    .catch((error) => {
      console.error("Redirect login failed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
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
    } finally {
      // onAuthStateChanged will set user to null and loading to false
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
