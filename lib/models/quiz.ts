import { Schema, model, models, type InferSchemaType } from "mongoose";

const questionSchema = new Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["short", "code"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    options: {
      type: [String],
      default: undefined,
    },
    answer: {
      type: String,
      default: "",
    },
    starterCode: {
      type: String,
      default: "",
    },
    rubric: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    attemptsAllowed: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    published: {
      type: Boolean,
      default: true,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export type QuestionDocument = InferSchemaType<typeof questionSchema> & {
  _id: string;
};

export type QuizDocument = InferSchemaType<typeof quizSchema> & {
  _id: string;
  questions: QuestionDocument[];
};

export const Quiz = models.Quiz || model("Quiz", quizSchema);
