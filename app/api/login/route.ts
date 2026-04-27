import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/user";
import {
  createSession,
  ensureDefaultAdmin,
  getPostLoginRedirect,
  verifyPassword,
} from "@/lib/auth";
import { badRequest } from "@/lib/http";

export async function POST(request: NextRequest) {
  await connectToDatabase();
  await ensureDefaultAdmin();
  const body = await request.json();
  const adminOnly = Boolean(body.adminOnly);
  const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : null;

  const identifier = String(body.identifier || body.email || body.username || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");

  if (!identifier || !password) {
    return badRequest("Identifier and password are required.");
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return badRequest("Invalid credentials.", 401);
  }

  if (adminOnly && user.role !== "admin") {
    return badRequest("Admin credentials are required.", 403);
  }

  await createSession(user._id.toString(), user.role);

  return NextResponse.json({
    ok: true,
    role: user.role,
    redirectTo: getPostLoginRedirect(user.role, redirectTo),
  });
}
