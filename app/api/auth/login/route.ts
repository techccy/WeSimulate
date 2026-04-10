import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken, validateUsername, validatePassword, sanitizeInput } from "@/lib/auth";
import { findUserByUsername } from "@/lib/storage";
import { rateLimit, getClientIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = rateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    const body = await request.json();
    const { username, password, captchaId, captchaCode } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "请填写用户名和密码" },
        { status: 400 }
      );
    }

    if (!captchaId || !captchaCode) {
      return NextResponse.json(
        { error: "请输入验证码" },
        { status: 400 }
      );
    }

    const { getCaptchaStore } = await import("../captcha/route");
    const captchaStore = getCaptchaStore();
    const stored = captchaStore.get(captchaId);
    
    if (!stored) {
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expires) {
      captchaStore.delete(captchaId);
      return NextResponse.json(
        { error: "验证码已过期" },
        { status: 400 }
      );
    }

    if (captchaCode.toLowerCase() !== stored.code) {
      return NextResponse.json(
        { error: "验证码错误" },
        { status: 400 }
      );
    }

    captchaStore.delete(captchaId);

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
      sameSite: "lax",
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
