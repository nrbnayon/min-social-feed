import { Document, model, Schema, Types } from "mongoose";

export type NotificationType = "like" | "comment";

export interface NotificationDocument extends Document {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  post: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment"],
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Paginated notifications feed for a user, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Fast unread count query
notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = model<NotificationDocument>("Notification", notificationSchema);
