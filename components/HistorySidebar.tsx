"use client";

import { useEffect, useState } from "react";
import { Draft } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface HistorySidebarProps {
  onLoadDraft: (draft: Draft) => void;
}

export default function HistorySidebar({ onLoadDraft }: HistorySidebarProps) {
  const { user, getDrafts, deleteDraft } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrafts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userDrafts = await getDrafts();
      setDrafts(userDrafts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error("获取草稿错误:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const handleDelete = async (draftId: string) => {
    if (!confirm("确定要删除这个草稿吗？")) return;
    
    const success = await deleteDraft(draftId);
    if (success) {
      setDrafts(drafts.filter((d) => d.id !== draftId));
    }
  };

  if (!user) return null;

  return (
    <div className="w-64 bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold mb-4">历史记录</h3>
      
      {loading ? (
        <p className="text-sm text-gray-500">加载中...</p>
      ) : drafts.length === 0 ? (
        <p className="text-sm text-gray-500">暂无草稿</p>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-3 border rounded hover:bg-gray-50 cursor-pointer group"
              onClick={() => onLoadDraft(draft)}
            >
              <div className="font-medium text-sm mb-1 truncate">
                {draft.title}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {new Date(draft.updatedAt).toLocaleString()}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(draft.id);
                }}
                className="text-red-500 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}