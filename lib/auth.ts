import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
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
