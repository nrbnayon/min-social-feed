import { Document, model, Schema } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}

const userSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  avatarUrl: String,
}, { timestamps: true });

export const User = model<UserDocument>("User", userSchema);
