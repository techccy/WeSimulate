import { NextRequest, NextResponse } from "next/server";

const captchaStore = new Map<string, { code: string; expires: number }>();

function generateCaptcha(): { text: string; svg: string } {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  
  for (let i = 0; i < 4; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const width = 120;
  const height = 40;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block;">`;
  
  svg += `<rect width="${width}" height="${height}" fill="#f0f0f0"/>`;
  
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`;
  }
  
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    svg += `<circle cx="${x}" cy="${y}" r="${Math.random() * 2}" fill="${color}"/>`;
  }
  
  const charWidth = (width - 20) / 4;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = 10 + i * charWidth + (Math.random() * 10 - 5);
    const y = height / 2 + (Math.random() * 8 - 4);
    const rotation = Math.random() * 30 - 15;
    const fontSize = 24 + Math.random() * 8;
    const color = `hsl(${Math.random() * 360}, 70%, 40%)`;
    svg += `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold" fill="${color}" transform="rotate(${rotation}, ${x}, ${y})">${char}</text>`;
  }
  
  svg += "</svg>";
  
  return { text, svg };
}

export async function GET(request: NextRequest) {
  try {
    const captchaData = generateCaptcha();

    const captchaId = Math.random().toString(36).substring(2, 15);
    const expires = Date.now() + 5 * 60 * 1000;

    captchaStore.set(captchaId, { code: captchaData.text.toLowerCase(), expires });

    cleanupExpiredCaptchas();

    console.log("验证码生成成功:", { captchaId, text: captchaData.text });

    return NextResponse.json({
      captchaId,
      svg: captchaData.svg,
    });
  } catch (error) {
    console.error("生成验证码失败:", error);
    return NextResponse.json(
      { error: "生成验证码失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { captchaId, captchaCode } = body;

    if (!captchaId || !captchaCode) {
      return NextResponse.json(
        { error: "验证码不能为空" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("验证码验证错误:", error);
    return NextResponse.json(
      { error: "验证失败" },
      { status: 500 }
    );
  }
}

export function getCaptchaStore() {
  return captchaStore;
}

function cleanupExpiredCaptchas() {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now > data.expires) {
      captchaStore.delete(id);
    }
  }
}
