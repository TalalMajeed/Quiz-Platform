import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/user";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { badRequest } from "@/lib/http";

export async function POST(request: NextRequest) {
  await requireAdmin();
  await connectToDatabase();
  const body = await request.json();

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email || !password) {
    return badRequest("Name, email, and password are required.");
  }

  if (password.length < 8) {
    return badRequest("Password must be at least 8 characters.");
  }

  const emailExists = await User.findOne({ email }).lean();

  if (emailExists) {
    return badRequest("That email already belongs to another account.");
  }

  const student = await User.create({
    name,
    email,
    passwordHash: hashPassword(password),
    role: "student",
    createdByAdmin: true,
  });

  return NextResponse.json({
    ok: true,
    student: {
      id: student._id.toString(),
      name: student.name,
      email: student.email || "",
    },
  });
}
