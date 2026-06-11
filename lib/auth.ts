import crypto from "crypto";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verify;
}

export async function getUser(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0] || null;
}

export async function createUser(username: string, password: string) {
  const hashed = await hashPassword(password);
  const result = await db.insert(users).values({ username, password: hashed }).returning();
  return result[0];
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const username = cookieStore.get("username")?.value;
  if (!userId || !username) return null;
  return { id: userId, username };
}