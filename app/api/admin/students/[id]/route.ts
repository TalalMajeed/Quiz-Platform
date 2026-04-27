import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { badRequest } from "@/lib/http";
import { Submission } from "@/lib/models/submission";
import { User } from "@/lib/models/user";
import { connectToDatabase } from "@/lib/mongoose";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();

  if (!Types.ObjectId.isValid(id)) {
    return badRequest("Student not found.", 404);
  }

  const student = await User.findOne({ _id: id, role: "student" });
  if (!student) {
    return badRequest("Student not found.", 404);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email) {
    return badRequest("Name and email are required.");
  }

  const emailExists = await User.findOne({
    _id: { $ne: student._id },
    email,
  }).lean();

  if (emailExists) {
    return badRequest("That email already belongs to another account.");
  }

  student.name = name;
  student.email = email;

  if (password) {
    if (password.length < 8) {
      return badRequest("Password must be at least 8 characters.");
    }

    student.passwordHash = hashPassword(password);
  }

  await student.save();

  return NextResponse.json({
    ok: true,
    student: {
      id: student._id.toString(),
      name: student.name,
      email: student.email || "",
      username: student.username || "",
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  await connectToDatabase();
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return badRequest("Student not found.", 404);
  }

  const student = await User.findOneAndDelete({ _id: id, role: "student" });
  if (!student) {
    return badRequest("Student not found.", 404);
  }

  await Submission.deleteMany({ userId: student._id });

  return NextResponse.json({ ok: true });
}
