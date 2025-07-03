"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  id: "1",
  name: "Alex Student",
  email: "alex.student@example.com",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated");
      if (storedAuth === "true") {
        setUser(mockUser);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = () => {
    setLoading(true);
    setUser(mockUser);
    try {
      localStorage.setItem("isAuthenticated", "true");
    } catch (error) {
        console.error("Could not access localStorage", error);
    }
    setLoading(false);
    router.push("/dashboard");
  };

  const logout = () => {
    setLoading(true);
    setUser(null);
    try {
      localStorage.removeItem("isAuthenticated");
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setLoading(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
