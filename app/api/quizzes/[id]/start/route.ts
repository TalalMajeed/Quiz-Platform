import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth";
import { ensureActiveSubmission } from "@/lib/quiz";
import { badRequest } from "@/lib/http";
import { serializeSubmission } from "@/lib/serializers";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStudent();
  const { id } = await params;
  const submission = await ensureActiveSubmission(id, user.id);

  if (submission === "limit_reached") {
    return badRequest("No attempts remaining for this quiz.", 403);
  }

  if (!submission) {
    return badRequest("Quiz not found.", 404);
  }

  return NextResponse.json({
    ok: true,
    submission: serializeSubmission(submission.toObject()),
  });
}
