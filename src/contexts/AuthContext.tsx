"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Agent, Session } from "@/types";
import {
  supabaseLogin,
  supabaseLogout,
  supabaseGetSession,
} from "@/lib/supabase/api";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  currentAgent: Agent | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const existingSession = supabaseGetSession();
    setSession(existingSession);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const newSession = await supabaseLogin(username, password);
      setSession(newSession);
      toast.success(`Welcome back, ${newSession.agent.name}!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid credentials"
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabaseLogout();
      setSession(null);
      toast.success("You have been successfully logged out.");
    } catch (error) {
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        currentAgent: session?.agent || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
