import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { Comment } from "../models/Comment.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/app-error.js";
import { pagination } from "../utils/pagination.js";
import { createAndSendNotification } from "./notification.service.js";
import type { CreatePostDTO, CreateCommentDTO, PaginatedResponse } from "../types/post.types.js";
import type { PostDocument } from "../models/Post.js";
import type { CommentDocument } from "../models/Comment.js";

// ─── List Posts (feed) ────────────────────────────────────────────────────────

/**
 * Returns a paginated feed of posts with populated authors, likes, and comments.
 * If `username` is supplied, filters to that author's posts only.
 */
export const listPosts = async (
  page = 1,
  limit = 20,
  username?: string
): Promise<PaginatedResponse<PostDocument>> => {
  const { page: safePage, limit: safeLimit } = pagination(page, limit);

  let authorFilter: Record<string, unknown> = {};
  if (username) {
    const author = await User.findOne({ username: username.toLowerCase().trim() }).select("_id");
    if (!author) {
      return {
        items: [],
        pagination: { page: safePage, limit: safeLimit, total: 0, hasMore: false },
      };
    }
    authorFilter = { author: author._id };
  }

  const [items, total] = await Promise.all([
    Post.find(authorFilter)
      .populate("author", "id username name avatar avatarUrl verified")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Post.countDocuments(authorFilter),
  ]);

  // Enrich posts with their likes and comments
  const postIds = items.map((p: any) => p._id);
  const [allLikes, allComments] = await Promise.all([
    Like.find({ post: { $in: postIds } }).lean(),
    Comment.find({ post: { $in: postIds } })
      .populate("author", "id username name avatar avatarUrl verified")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const likesByPost = new Map<string, string[]>();
  allLikes.forEach((l: any) => {
    const pId = l.post.toString();
    const uId = l.user.toString();
    if (!likesByPost.has(pId)) likesByPost.set(pId, []);
    likesByPost.get(pId)!.push(uId);
  });

  const commentsByPost = new Map<string, any[]>();
  allComments.forEach((c: any) => {
    const pId = c.post.toString();
    if (!commentsByPost.has(pId)) commentsByPost.set(pId, []);
    commentsByPost.get(pId)!.push(c);
  });

  const enrichedItems = items.map((post: any) => {
    const pId = post._id.toString();
    const postLikes = likesByPost.get(pId) || [];
    const postComments = commentsByPost.get(pId) || [];
    return {
      ...post,
      likes: postLikes,
      likeCount: Math.max(post.likeCount || 0, postLikes.length),
      comments: postComments,
      commentCount: Math.max(post.commentCount || 0, postComments.length),
    };
  });

  return {
    items: enrichedItems as unknown as PostDocument[],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: safePage * safeLimit < total,
    },
  };
};

// ─── Get Single Post by ID ───────────────────────────────────────────────────

export const getPostById = async (id: string): Promise<PostDocument> => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Post not found.", 404);
  }

  const post = await Post.findById(id)
    .populate("author", "id username name avatar avatarUrl verified")
    .lean();

  if (!post) {
    throw new AppError("Post not found.", 404);
  }

  const [likes, comments] = await Promise.all([
    Like.find({ post: post._id }).lean(),
    Comment.find({ post: post._id })
      .populate("author", "id username name avatar avatarUrl verified")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const postLikes = likes.map((l: any) => l.user.toString());

  return {
    ...post,
    likes: postLikes,
    likeCount: Math.max(post.likeCount || 0, postLikes.length),
    comments,
    commentCount: Math.max(post.commentCount || 0, comments.length),
  } as unknown as PostDocument;
};

// ─── Create Post ──────────────────────────────────────────────────────────────

export const createPost = async (
  authorId: string,
  dto: CreatePostDTO
): Promise<PostDocument> => {
  const post = await Post.create({
    author: authorId,
    content: dto.content,
    images: dto.images ?? [],
  });
  await post.populate("author", "id username name avatar avatarUrl verified");
  return post;
};

// ─── Toggle Like ──────────────────────────────────────────────────────────────

/**
 * Toggles a like on a post.
 * Fires a push notification to the post author when liked (not unliked).
 */
export const toggleLike = async (
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> => {
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Post not found.", 404);
  }

  const post = await Post.findById(postId).select("likeCount author");
  if (!post) {
    throw new AppError("Post not found.", 404);
  }

  const existing = await Like.findOne({ post: postId, user: userId });

  if (existing) {
    await existing.deleteOne();
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: -1 } },
      { returnDocument: "after" }
    ).select("likeCount");
    return { liked: false, likeCount: Math.max(0, updated?.likeCount ?? 0) };
  }

  await Like.create({ post: postId, user: userId });
  const updated = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likeCount: 1 } },
    { returnDocument: "after" }
  ).select("likeCount");

  // Fire-and-forget push to the post author (only if not self-like)
  const postAuthorId = (post.author?._id ?? post.author)?.toString();
  const actorId = String(userId);
  if (postAuthorId && postAuthorId !== actorId) {
    void createAndSendNotification(
      postAuthorId,
      actorId,
      "like",
      postId
    );
  }

  return { liked: true, likeCount: updated?.likeCount ?? 1 };
};

// ─── Add Comment ──────────────────────────────────────────────────────────────

/**
 * Adds a comment to a post.
 * Fires a push notification to the post author.
 */
export const addComment = async (
  postId: string,
  authorId: string,
  dto: CreateCommentDTO
): Promise<CommentDocument> => {
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    throw new AppError("Post not found.", 404);
  }

  const post = await Post.findById(postId).select("author");
  if (!post) {
    throw new AppError("Post not found.", 404);
  }

  const [comment] = await Promise.all([
    Comment.create({ post: postId, author: authorId, content: dto.content }),
    Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
  ]);

  await comment.populate("author", "id username name avatar avatarUrl verified");

  // Fire-and-forget push to the post author (only if not self-comment)
  const postAuthorId = (post.author?._id ?? post.author)?.toString();
  const actorId = String(authorId);
  if (postAuthorId && postAuthorId !== actorId) {
    void createAndSendNotification(
      postAuthorId,
      actorId,
      "comment",
      postId
    );
  }

  return comment;
};
