import { Document, model, Schema, Types } from "mongoose";

export interface PostDocument extends Document {
  author: Types.ObjectId;
  content: string;
  likeCount: number;
  commentCount: number;
}

const postSchema = new Schema<PostDocument>({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Post = model<PostDocument>("Post", postSchema);
