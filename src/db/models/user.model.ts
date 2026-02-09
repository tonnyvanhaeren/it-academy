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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Voeg een virtual property toe om de datum te formatteren
userSchema.virtual('formattedCreatedAt').get(function () {
  const date = this.createdAt;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
});

// Herhaal voor andere datumvelden indien nodig
userSchema.virtual('formattedUpdatedAt').get(function () {
  const date = this.updatedAt;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
});


export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);