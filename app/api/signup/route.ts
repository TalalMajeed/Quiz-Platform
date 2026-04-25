import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/user";
import { createSession, hashPassword } from "@/lib/auth";
import { badRequest } from "@/lib/http";

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const body = await request.json();

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name) {
    return badRequest("Name is required.");
  }

  if (!email && !username) {
    return badRequest("Provide at least an email or a username.");
  }

  if (password.length < 8) {
    return badRequest("Password must be at least 8 characters.");
  }

  const emailExists = email ? await User.findOne({ email }).lean() : null;
  if (emailExists) {
    return badRequest("That email is already registered.");
  }

  const usernameExists = username ? await User.findOne({ username }).lean() : null;
  if (usernameExists) {
    return badRequest("That username is already taken.");
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  const role = adminCount === 0 ? "admin" : "student";

  const user = await User.create({
    name,
    email: email || undefined,
    username: username || undefined,
    passwordHash: hashPassword(password),
    role,
    createdByAdmin: false,
  });

  await createSession(user._id.toString(), role);

  return NextResponse.json({
    ok: true,
    role,
    redirectTo: role === "admin" ? "/admin" : "/quizzes",
  });
}
