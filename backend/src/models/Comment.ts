import { Document, model, Schema, Types } from "mongoose";

export interface CommentDocument extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<CommentDocument>({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true });

export const Comment = model<CommentDocument>("Comment", commentSchema);
