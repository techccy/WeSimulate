import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { Draft } from "@/types";
import { getDraftsByUserId, saveDraft as saveDraftToStorage } from "@/lib/storage";
import { rateLimit, getClientIp, sanitizeHtml } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = rateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
    }

    const drafts = await getDraftsByUserId(decoded.id);
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("获取草稿错误:", error);
    return NextResponse.json({ error: "获取草稿失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = rateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
    }

    const body = await request.json();
    const { data, title } = body;

    if (!data || !title) {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    const sanitizedTitle = sanitizeHtml(title.substring(0, 100));

    const draft: Draft = {
      id: crypto.randomUUID(),
      userId: decoded.id,
      title: sanitizedTitle,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveDraftToStorage(draft);

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    console.error("保存草稿错误:", error);
    return NextResponse.json({ error: "保存草稿失败" }, { status: 500 });
  }
}