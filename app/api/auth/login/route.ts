import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken, validateUsername, validatePassword, sanitizeInput } from "@/lib/auth";
import { findUserByUsername } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "请填写用户名和密码" },
        { status: 400 }
      );
    }

    const sanitizedUsername = sanitizeInput(username);
    
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(sanitizedUsername);
    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.username);

    const response = NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("登录错误:", error);
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    );
  }
}
