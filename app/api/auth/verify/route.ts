import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "登录已过期" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: decoded.id,
        username: decoded.username,
      },
    });
  } catch (error) {
    console.error("验证错误:", error);
    return NextResponse.json(
      { error: "验证失败" },
      { status: 500 }
    );
  }
}
