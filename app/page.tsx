"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import MomentPreview from "@/components/MomentPreview";
import EditorPanel from "@/components/EditorPanel";
import AuthModal from "@/components/AuthModal";
import HistorySidebar from "@/components/HistorySidebar";
import { useAuth } from "@/contexts/AuthContext";
import { MomentPost, Draft } from "@/types";

const defaultData: MomentPost = {
  avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='20'%3E头像%3C/text%3E%3C/svg%3E",
  nickname: "发布者昵称",
  content: "内容",
  images: [],
  location: "",
  timestamp: "1分钟前",
  likes: ["点赞人1", "点赞人2", "点赞人3"],
  comments: [],
};

const DEVICE_WIDTHS = {
  mobile: 375,
  tablet: 768,
  desktop: 1200,
};

export default function Home() {
  const [data, setData] = useState<MomentPost>(defaultData);
  const [showComments, setShowComments] = useState(true);
  const [deviceType, setDeviceType] = useState<keyof typeof DEVICE_WIDTHS>("mobile");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [draftPrompt, setDraftPrompt] = useState(false);
  const [latestDraft, setLatestDraft] = useState<Draft | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout, saveDraft, getDrafts } = useAuth();

  useEffect(() => {
    if (user) {
      checkDrafts();
    }
  }, [user]);

  const checkDrafts = async () => {
    const drafts = await getDrafts();
    if (drafts.length > 0) {
      setLatestDraft(drafts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0]);
      setDraftPrompt(true);
    }
  };

  const handleSaveDraft = async () => {
    const draft = await saveDraft(data);
    if (draft) {
      alert("草稿保存成功！");
    } else {
      alert("草稿保存失败");
    }
  };

  const handleLoadDraft = (draft: Draft) => {
    setData(draft);
    setDraftPrompt(false);
  };

  const handleExport = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!previewRef.current) return;

    try {
      const element = previewRef.current.querySelector('.post-container') as HTMLElement;
      if (!element) {
        alert("未找到预览元素");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        width: element.scrollWidth,
        backgroundColor: "#f5f5f5",
        logging: false,
      });

      const originalWidth = canvas.width;
      const originalHeight = canvas.height;
      const newWidth = Math.floor(originalWidth * 1.4);
      const newHeight = Math.floor(originalHeight * 1.2);

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = newWidth;
      finalCanvas.height = newHeight;
      const ctx = finalCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(canvas, Math.floor(originalWidth * 0.2), Math.floor(originalHeight * 0.1));
      }

      const dataUrl = finalCanvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `moment-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      await saveDraft(data);
      setData(defaultData);
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">WeSimulate</h1>
            {!loading && (
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700">欢迎, {user.username}</span>
                    <button
                      onClick={logout}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      退出
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }}
                      className="text-sm text-blue-500 hover:text-blue-600 px-3 py-1 border border-blue-500 rounded"
                    >
                      登录
                    </button>
                    <button
                      onClick={() => { setAuthMode("register"); setAuthModalOpen(true); }}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      注册
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-600">朋友圈模拟生成器</p>
        </div>

        {draftPrompt && latestDraft && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-blue-800">继续编辑上次的草稿？</span>
            <button
              onClick={() => handleLoadDraft(latestDraft)}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              点击继续
            </button>
            <button
              onClick={() => setDraftPrompt(false)}
              className="text-gray-500 hover:text-gray-600 text-sm ml-4"
            >
              关闭
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <EditorPanel
                data={data}
                onChange={setData}
                showComments={showComments}
                onToggleComments={() => setShowComments(!showComments)}
                onSaveDraft={handleSaveDraft}
                onShowLoginModal={() => { setAuthMode("login"); setAuthModalOpen(true); }}
              />

              <div className="sticky top-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">预览</h2>
                    <button
                      onClick={handleExport}
                      className={`px-4 py-2 rounded transition-colors ${
                        user
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!user}
                    >
                      导出图片
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium">设备:</span>
                    {(["mobile", "tablet", "desktop"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDeviceType(type)}
                        className={`px-3 py-1 rounded text-sm ${
                          deviceType === type
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {type === "mobile" ? "手机端" : type === "tablet" ? "平板端" : "电脑端"}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#f5f5f5] p-4 rounded flex justify-center">
                    <div ref={previewRef}>
                      <MomentPreview
                        data={data}
                        showComments={showComments}
                        width={DEVICE_WIDTHS[deviceType]}
                      />
                    </div>
                  </div>

                  {!user && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-800 text-sm">
                      请先注册/登录
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-64">
            <HistorySidebar onLoadDraft={handleLoadDraft} />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </main>
  );
}
