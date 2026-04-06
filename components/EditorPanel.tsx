"use client";

import { useState } from "react";
import { MomentPost } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface EditorPanelProps {
  data: MomentPost;
  onChange: (data: MomentPost) => void;
  showComments: boolean;
  onToggleComments: () => void;
  onSaveDraft: () => void;
  onShowLoginModal?: () => void;
}

export default function EditorPanel({
  data,
  onChange,
  showComments,
  onToggleComments,
  onSaveDraft,
  onShowLoginModal,
}: EditorPanelProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const [compressModal, setCompressModal] = useState<{ file: File; resolve: (compress: boolean) => void } | null>(null);

  const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const checkFileSizeAndCompress = async (files: File[]): Promise<{ filesToUpload: File[]; hasError: boolean }> => {
    const filesToUpload: File[] = [];
    let hasError = false;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        const shouldCompress = await new Promise<boolean>((resolve) => {
          setCompressModal({ file, resolve });
        });

        if (!shouldCompress) {
          hasError = true;
          break;
        }

        const compressedFile = await compressImage(file);
        filesToUpload.push(compressedFile);
      } else {
        filesToUpload.push(file);
      }
    }

    return { filesToUpload, hasError };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      if (onShowLoginModal) {
        onShowLoginModal();
      } else {
        alert("请先登录后上传照片");
      }
      return;
    }

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const { filesToUpload, hasError } = await checkFileSizeAndCompress(files);

    if (hasError) {
      e.target.value = '';
      return;
    }

    const totalImages = data.images.length + filesToUpload.length;
    if (totalImages > 9) {
      alert("最多只能上传9张图片");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `上传失败 (${response.status})`);
        }

        const result = await response.json();
        return result.imageUrl;
      });

      const newImages = await Promise.all(uploadPromises);
      onChange({ ...data, images: [...data.images, ...newImages] });
    } catch (error) {
      console.error("上传错误:", error);
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange({
      ...data,
      images: data.images.filter((_, i) => i !== index),
    });
  };

  const handleLikesChange = (value: string) => {
    const lines = value.split("\n").map((s) => s.trim());
    const filteredLines = lines.filter((s, i) => {
      const isNotEmpty = s !== "";
      const isLast = i === lines.length - 1;
      return isNotEmpty || isLast;
    });
    onChange({
      ...data,
      likes: filteredLines,
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      if (onShowLoginModal) {
        onShowLoginModal();
      } else {
        alert("请先登录后上传头像");
      }
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const { filesToUpload, hasError } = await checkFileSizeAndCompress([file]);

    if (hasError) {
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", filesToUpload[0]);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `上传失败 (${response.status})`);
      }

      const result = await response.json();
      onChange({ ...data, avatar: result.imageUrl });
    } catch (error) {
      console.error("上传错误:", error);
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="editor-panel w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">编辑面板</h2>
        <button
          onClick={onSaveDraft}
          className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          保存草稿
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">头像</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {uploading && <span className="text-xs text-gray-500">上传中...</span>}
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
            disabled={uploading}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {uploading && <span className="text-xs text-gray-500">上传中...</span>}
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
          <label className="block text-sm font-medium mb-1">点赞人 (换行分隔)</label>
          <textarea
            value={data.likes.join("\n")}
            onChange={(e) => handleLikesChange(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24 resize-none"
            placeholder="如：张三&#10;李四&#10;王五"
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
          <div className="space-y-3">
            {data.comments.map((comment, index) => (
              <div key={index} className="border rounded p-3">
                <input
                  type="text"
                  value={comment.user}
                  onChange={(e) => handleCommentsChange(index, "user", e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm mb-2"
                  placeholder="评论人昵称"
                />
                <input
                  type="text"
                  value={comment.text}
                  onChange={(e) => handleCommentsChange(index, "text", e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="评论内容"
                />
                <button
                  onClick={() => removeComment(index)}
                  className="mt-2 text-red-500 hover:text-red-600 text-sm"
                >
                  删除
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
        </div>
      </div>

      {compressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">文件过大</h3>
            <p className="text-gray-600 mb-4">
              文件 "{compressModal.file.name}" 超过 5MB，是否压缩后上传？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  compressModal.resolve(false);
                  setCompressModal(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={() => {
                  compressModal.resolve(true);
                  setCompressModal(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                压缩并上传
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
