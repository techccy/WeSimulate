import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, validateImageDimensions } from "@/lib/security";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "不支持的文件类型" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "文件大小超过限制（5MB）" };
  }

  const filename = file.name.toLowerCase();
  const disallowedPatterns = [
    /\.\./,
    /\0/,
    /\.(exe|bat|sh|php|js|vbs|jar|apk)$/,
  ];

  for (const pattern of disallowedPatterns) {
    if (pattern.test(filename)) {
      return { valid: false, error: "无效的文件名" };
    }
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    console.log("开始上传图片...");

    const ip = getClientIp(request);
    const rateCheck = rateLimit(ip);

    if (!rateCheck.success) {
      console.log("速率限制:", rateCheck.error);
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("文件信息:", {
      name: file?.name,
      type: file?.type,
      size: file?.size,
    });

    if (!file) {
      console.log("没有文件");
      return NextResponse.json({ error: "没有文件" }, { status: 400 });
    }

    const validation = validateImage(file);
    if (!validation.valid) {
      console.log("文件验证失败:", validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Buffer 大小:", buffer.length);

    const dimensionCheck = validateImageDimensions(buffer);
    if (!dimensionCheck.valid) {
      console.log("图片尺寸验证失败:", dimensionCheck.error);
      return NextResponse.json({ error: dimensionCheck.error }, { status: 400 });
    }

    const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const extension = safeFilename.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    console.log("准备保存文件到:", filepath);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filepath, buffer);

    console.log("文件保存成功");

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    console.error("图片上传错误:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "图片上传失败" }, { status: 500 });
  }
}