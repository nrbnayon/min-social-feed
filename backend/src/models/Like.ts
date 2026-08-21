import { Document, model, Schema, Types } from "mongoose";

export interface LikeDocument extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<LikeDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: one like per user per post + fast lookups
likeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = model<LikeDocument>("Like", likeSchema);
