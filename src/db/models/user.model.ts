import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  firstname: string;
  lastname: string;
  mobile: string;
  hashedPassword: string;
  role: "student" | "teacher" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    firstname: { type: String, required: true, minlength: 2 },
    lastname: { type: String, required: true, minlength: 2 },
    mobile: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);
export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);