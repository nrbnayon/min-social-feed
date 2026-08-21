import { Document, model, Schema, Types } from "mongoose";

export interface PostDocument extends Document {
  author: Types.ObjectId;
  content: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
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
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound index: fetch a user's posts sorted newest-first
postSchema.index({ author: 1, createdAt: -1 });

// Text search on content
postSchema.index({ content: "text" });

export const Post = model<PostDocument>("Post", postSchema);
