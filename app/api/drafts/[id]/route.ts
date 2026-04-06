import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { deleteDraft } from "@/lib/storage";
import { rateLimit, getClientIp } from "@/lib/security";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: draftId } = await params;
    await deleteDraft(draftId);

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除草稿错误:", error);
    return NextResponse.json({ error: "删除草稿失败" }, { status: 500 });
  }
}