import { Schema, model, models, type InferSchemaType } from "mongoose";

const answerSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    responseText: {
      type: String,
      default: "",
    },
    selectedOption: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      default: "",
    },
    awardedPoints: {
      type: Number,
      default: 0,
    },
    autoAwardedPoints: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

export type SubmissionAnswer = {
  questionId: string;
  responseText: string;
  selectedOption: string;
  code: string;
  awardedPoints: number;
  autoAwardedPoints: number;
  feedback: string;
};

const submissionSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded", "expired"],
      default: "in_progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    gradedAt: {
      type: Date,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    autoScore: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ quizId: 1, userId: 1, status: 1 });

export type SubmissionDocument = InferSchemaType<typeof submissionSchema> & {
  _id: string;
};

export const Submission =
  models.Submission || model("Submission", submissionSchema);
