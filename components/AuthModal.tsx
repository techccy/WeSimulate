"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const fetchCaptcha = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/captcha", {
        method: "GET",
      });
      const data = await response.json();
      
      if (data.svg) {
        setCaptchaSvg(data.svg);
        setCaptchaId(data.captchaId);
        setCaptchaCode("");
      } else {
        console.error("验证码数据无效:", data);
      }
    } catch (error) {
      console.error("获取验证码失败:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
    }
  }, [isOpen, fetchCaptcha]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaCode) {
      setError("请输入验证码");
      setLoading(false);
      return;
    }

    const result = isRegister
      ? await register(username, password, confirmPassword, captchaId, captchaCode)
      : await login(username, password, captchaId, captchaCode);

    setLoading(false);

    if (result.success) {
      if (isRegister) {
        setIsRegister(false);
        setError("注册成功，请登录！");
        fetchCaptcha();
        return;
      }
      onClose();
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setCaptchaCode("");
    } else {
      setError(result.error || "操作失败");
      fetchCaptcha();
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setCaptchaCode("");
    fetchCaptcha();
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

          <div>
            <label className="block text-sm font-medium mb-1">验证码</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入验证码"
                required
                maxLength={4}
              />
              <div
                className="w-32 h-10 border rounded cursor-pointer bg-white overflow-hidden"
                onClick={fetchCaptcha}
                dangerouslySetInnerHTML={{ __html: captchaSvg || '<span class="text-xs text-gray-400">加载中...</span>' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">点击图片刷新验证码</p>
          </div>

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
