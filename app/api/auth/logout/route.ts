import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "登出成功" });
  response.cookies.delete("auth-token");
  return response;
}
