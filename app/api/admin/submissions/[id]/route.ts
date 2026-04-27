import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { badRequest } from "@/lib/http";
import { Submission } from "@/lib/models/submission";
import { connectToDatabase } from "@/lib/mongoose";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  await connectToDatabase();
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return badRequest("Submission not found.", 404);
  }

  const submission = await Submission.findByIdAndDelete(id);
  if (!submission) {
    return badRequest("Submission not found.", 404);
  }

  return NextResponse.json({ ok: true });
}
