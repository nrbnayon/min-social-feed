import { Document, model, Schema, Types } from "mongoose";

export interface CommentDocument extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId | null;
  replyTo?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: paginated comments on a post ordered chronologically
commentSchema.index({ post: 1, createdAt: 1 });

export const Comment = model<CommentDocument>("Comment", commentSchema);
