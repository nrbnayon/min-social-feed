import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { Comment } from "../models/Comment.js";

export const listPosts = async (page = 1, limit = 20, username?: string) => {
  const query = username ? { content: { $regex: username, $options: "i" } } : {};
  const [items, total] = await Promise.all([
    Post.find(query).populate("author", "username avatarUrl").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(query),
  ]);
  return { items, page, limit, total, hasMore: page * limit < total };
};
export const createPost = (author: string, content: string) => Post.create({ author, content });
export const toggleLike = async (post: string, user: string) => {
  const existing = await Like.findOne({ post, user });
  if (existing) { await existing.deleteOne(); await Post.findByIdAndUpdate(post, { $inc: { likeCount: -1 } }); return { liked: false }; }
  await Like.create({ post, user }); await Post.findByIdAndUpdate(post, { $inc: { likeCount: 1 } }); return { liked: true };
};
export const addComment = async (post: string, author: string, content: string) => {
  const comment = await Comment.create({ post, author, content });
  await Post.findByIdAndUpdate(post, { $inc: { commentCount: 1 } });
  return comment.populate("author", "username avatarUrl");
};
