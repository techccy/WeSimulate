"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = isRegister
      ? await register(username, password, confirmPassword)
      : await login(username, password);

    setLoading(false);

    if (result.success) {
      if (isRegister) {
        setIsRegister(false);
        setError("注册成功，请登录！");
        return;
      }
      onClose();
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error || "操作失败");
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "注册" : "登录"}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请再次输入密码"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "处理中..." : isRegister ? "注册" : "登录"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {isRegister ? "已有账号？" : "没有账号？"}
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-500 hover:text-blue-600 ml-1"
          >
            {isRegister ? "立即登录" : "立即注册"}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
