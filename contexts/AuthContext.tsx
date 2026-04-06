"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MomentPost, Draft } from "@/types";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, captchaId: string, captchaCode: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, confirmPassword: string, captchaId: string, captchaCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  saveDraft: (data: MomentPost) => Promise<Draft | null>;
  getDrafts: () => Promise<Draft[]>;
  deleteDraft: (draftId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("检查认证失败:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string, captchaId: string, captchaCode: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaId, captchaCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "登录失败" };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("登录错误:", error);
      return { success: false, error: "网络错误，请重试" };
    }
  };

  const register = async (username: string, password: string, confirmPassword: string, captchaId: string, captchaCode: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword, captchaId, captchaCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "注册失败" };
      }

      return { success: true };
    } catch (error) {
      console.error("注册错误:", error);
      return { success: false, error: "网络错误，请重试" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("登出错误:", error);
    }
  };

  const saveDraft = async (data: MomentPost): Promise<Draft | null> => {
    try {
      const title = data.content.substring(0, 10) || "未命名草稿";
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, title }),
      });

      const result = await response.json();
      if (!response.ok) {
        return null;
      }
      return result.draft;
    } catch (error) {
      console.error("保存草稿错误:", error);
      return null;
    }
  };

  const getDrafts = async (): Promise<Draft[]> => {
    try {
      const response = await fetch("/api/drafts", { method: "GET" });
      const data = await response.json();
      return data.drafts || [];
    } catch (error) {
      console.error("获取草稿错误:", error);
      return [];
    }
  };

  const deleteDraft = async (draftId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/drafts/${draftId}`, { method: "DELETE" });
      return response.ok;
    } catch (error) {
      console.error("删除草稿错误:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, saveDraft, getDrafts, deleteDraft }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
