import { NextRequest, NextResponse } from "next/server";
import { getUser, createUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    if (username.length < 3)
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const existing = await getUser(username);
    if (existing)
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });

    const user = await createUser(username, password);

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
    cookieStore.set("username", user.username, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: "/" });

    return NextResponse.json({ success: true, username: user.username });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
