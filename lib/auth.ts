import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export interface User {
  id: string;
  username: string;
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, username: string): string {
  return jwt.sign(
    { id: userId, username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): { id: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
  } catch (error) {
    return null;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .substring(0, 50);
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: "用户名至少需要3个字符" };
  }
  if (username.length > 20) {
    return { valid: false, error: "用户名最多20个字符" };
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return { valid: false, error: "用户名只能包含字母、数字、下划线和中文" };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 6) {
    return { valid: false, error: "密码至少需要6个字符" };
  }
  if (password.length > 50) {
    return { valid: false, error: "密码最多50个字符" };
  }
  return { valid: true };
}
