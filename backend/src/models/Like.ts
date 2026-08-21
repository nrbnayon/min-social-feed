import { Document, model, Schema, Types } from "mongoose";

export interface LikeDocument extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
}

const likeSchema = new Schema<LikeDocument>({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
likeSchema.index({ post: 1, user: 1 }, { unique: true });
export const Like = model<LikeDocument>("Like", likeSchema);
