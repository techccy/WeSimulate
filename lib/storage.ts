import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function createUser(username: string, hashedPassword: string): Promise<User> {
  const users = await getUsers();
  
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("用户名已存在");
  }
  
  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  await saveUsers(users);
  
  return newUser;
}
