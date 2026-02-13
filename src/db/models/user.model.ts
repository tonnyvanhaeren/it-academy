import mongoose, { Schema, Document, Types } from "mongoose";

function formatDate(value: Date | string | number | null | undefined): string | null {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  // const day = String(d.getDate()).padStart(2, '0');
  const day = d.getDate().toString(); // zonder leading zero
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  firstname: string;
  lastname: string;
  mobile: string;
  hashedPassword: string;
  role: "student" | "teacher" | "admin";
  createdAt: Date;
  createdAtFormatted?: string | null;
  updatedAt: Date;
  updatedAtFormatted?: string | null;
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
    createdAt: {
      type: Date,
      default: Date.now,
      get: formatDate as any
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      get: formatDate as any
    }
  },
  {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true }
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);