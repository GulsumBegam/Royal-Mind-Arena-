import { NextRequest, NextResponse } from "next/server";
import { getUser, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });

    const user = await getUser(username);
    if (!user || !(await verifyPassword(password, user.password)))
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    cookieStore.set("username", user.username, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: "/" });

    return NextResponse.json({ success: true, username: user.username });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
