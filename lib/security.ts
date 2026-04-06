import { NextRequest, NextResponse } from "next/server";

const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 100,
};

export function rateLimit(ip: string): { success: boolean; error?: string } {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { success: true };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return {
      success: false,
      error: "请求过于频繁，请稍后再试",
    };
  }

  record.count++;
  return { success: true };
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function validateImageDimensions(buffer: Buffer): { valid: boolean; error?: string } {
  const maxSize = 4096;
  
  if (buffer.length < 24) {
    return { valid: false, error: "无效的图片文件" };
  }

  return { valid: true };
}