"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import MomentPreview from "@/components/MomentPreview";
import EditorPanel from "@/components/EditorPanel";
import { MomentPost } from "@/types";

const defaultData: MomentPost = {
  avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='20'%3E头像%3C/text%3E%3C/svg%3E",
  nickname: "发布者昵称",
  content: "内容",
  images: [],
  location: "",
  timestamp: "29分钟前",
  likes: ["点赞人1", "点赞人2", "点赞人3"],
  comments: [
    { user: "评论人1", text: "评论内容1" },
    { user: "评论人2", text: "评论内容2" },
    { user: "评论人3", text: "评论内容3" },
  ],
};

export default function Home() {
  const [data, setData] = useState<MomentPost>(defaultData);
  const [showComments, setShowComments] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!previewRef.current) return;

    try {
      const element = previewRef.current.querySelector('.post-container') as HTMLElement;
      if (!element) {
        alert("未找到预览元素");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#f5f5f5",
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `moment-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">WeSimulate</h1>
          <p className="text-gray-600">朋友圈模拟生成器</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <EditorPanel
            data={data}
            onChange={setData}
            showComments={showComments}
            showDelete={showDelete}
            onToggleComments={() => setShowComments(!showComments)}
            onToggleDelete={() => setShowDelete(!showDelete)}
          />

          <div className="sticky top-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">预览</h2>
                <button
                  onClick={handleExport}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  导出图片
                </button>
              </div>

              <div className="bg-[#f5f5f5] p-4 rounded flex justify-center">
                <div ref={previewRef}>
                  <MomentPreview
                    data={data}
                    showComments={showComments}
                    showDelete={showDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
