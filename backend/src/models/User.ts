import { Document, model, Schema, Types } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  refreshTokens: string[];
  expoPushToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends IUser, Document {
  toPublicJSON: () => {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    avatarUrl: string;
    coverImage: string;
    bio: string;
    location: string;
    website: string;
    verified: boolean;
    followers: number;
    following: number;
    followersList: string[];
    followingList: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
    },
    website: {
      type: String,
      default: "",
      maxlength: 200,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    expoPushToken: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.refreshTokens;
        return ret;
      },
    },
  }
);

// Method to format a public profile with computed follower & following counts
userSchema.methods.toPublicJSON = function () {
  const avatarImage = this.avatar || this.avatarUrl || "";
  return {
    id: this._id?.toString() || this.id,
    name: this.name || this.username,
    username: this.username,
    email: this.email,
    avatar: avatarImage,
    avatarUrl: avatarImage,
    coverImage: this.coverImage || "",
    bio: this.bio || "",
    location: this.location || "",
    website: this.website || "",
    verified: Boolean(this.verified),
    followers: Array.isArray(this.followers) ? this.followers.length : 0,
    following: Array.isArray(this.following) ? this.following.length : 0,
    followersList: Array.isArray(this.followers) ? this.followers.map((f: any) => f.toString()) : [],
    followingList: Array.isArray(this.following) ? this.following.map((f: any) => f.toString()) : [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = model<UserDocument>("User", userSchema);
