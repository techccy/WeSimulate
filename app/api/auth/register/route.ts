import { NextRequest, NextResponse } from "next/server";
import { hashPassword, validateUsername, validatePassword, sanitizeInput } from "@/lib/auth";
import { createUser, findUserByUsername } from "@/lib/storage";
import { rateLimit, getClientIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = rateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    const body = await request.json();
    const { username, password, confirmPassword, captchaId, captchaCode } = body;

    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "请填写所有字段" },
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

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "两次输入的密码不一致" },
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

    const existingUser = await findUserByUsername(sanitizedUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已被注册" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(sanitizedUsername, hashedPassword);

    return NextResponse.json(
      { message: "注册成功", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "注册失败，请重试" },
      { status: 500 }
    );
  }
}
