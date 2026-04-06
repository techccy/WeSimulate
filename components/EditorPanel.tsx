"use client";

import { useState } from "react";
import { MomentPost } from "@/types";

interface EditorPanelProps {
  data: MomentPost;
  onChange: (data: MomentPost) => void;
  showComments: boolean;
  showDelete: boolean;
  onToggleComments: () => void;
  onToggleDelete: () => void;
}

export default function EditorPanel({
  data,
  onChange,
  showComments,
  showDelete,
  onToggleComments,
  onToggleDelete,
}: EditorPanelProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = data.images.length + files.length;
    if (totalImages > 9) {
      alert("最多只能上传9张图片");
      return;
    }

    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then((newImages) => {
      onChange({ ...data, images: [...data.images, ...newImages] });
    });
  };

  const removeImage = (index: number) => {
    onChange({
      ...data,
      images: data.images.filter((_, i) => i !== index),
    });
  };

  const handleLikesChange = (value: string) => {
    onChange({
      ...data,
      likes: value.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  const handleCommentsChange = (index: number, field: "user" | "text", value: string) => {
    const newComments = [...data.comments];
    newComments[index] = { ...newComments[index], [field]: value };
    onChange({ ...data, comments: newComments });
  };

  const addComment = () => {
    onChange({ ...data, comments: [...data.comments, { user: "", text: "" }] });
  };

  const removeComment = (index: number) => {
    onChange({
      ...data,
      comments: data.comments.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="editor-panel w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">编辑面板</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">头像</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  onChange({ ...data, avatar: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">昵称</label>
          <input
            type="text"
            value={data.nickname}
            onChange={(e) => onChange({ ...data, nickname: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="输入昵称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">正文内容</label>
          <textarea
            value={data.content}
            onChange={(e) => onChange({ ...data, content: e.target.value })}
            className="w-full border rounded px-3 py-2 h-24 resize-none"
            placeholder="输入正文内容"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">图片 (最多9张)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {data.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {data.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">位置 (可选)</label>
          <input
            type="text"
            value={data.location || ""}
            onChange={(e) => onChange({ ...data, location: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="输入位置"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">发布时间</label>
          <input
            type="text"
            value={data.timestamp}
            onChange={(e) => onChange({ ...data, timestamp: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="如：29分钟前"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">点赞人 (逗号分隔)</label>
          <input
            type="text"
            value={data.likes.join(", ")}
            onChange={(e) => handleLikesChange(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="如：张三, 李四, 王五"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">评论</label>
            <button
              onClick={addComment}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + 添加评论
            </button>
          </div>
          <div className="space-y-2">
            {data.comments.map((comment, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={comment.user}
                  onChange={(e) => handleCommentsChange(index, "user", e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  placeholder="用户名"
                />
                <input
                  type="text"
                  value={comment.text}
                  onChange={(e) => handleCommentsChange(index, "text", e.target.value)}
                  className="flex-[2] border rounded px-3 py-2 text-sm"
                  placeholder="评论内容"
                />
                <button
                  onClick={() => removeComment(index)}
                  className="text-red-500 hover:text-red-600 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showComments}
              onChange={onToggleComments}
            />
            <span className="text-sm">显示评论区</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDelete}
              onChange={onToggleDelete}
            />
            <span className="text-sm">显示删除按钮</span>
          </label>
        </div>
      </div>
    </div>
  );
}
