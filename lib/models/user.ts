import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
};

export const User = models.User || model("User", userSchema);
