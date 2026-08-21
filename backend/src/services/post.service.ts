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
 * Returns a paginated feed of posts.
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

  return {
    items: items as unknown as PostDocument[],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: safePage * safeLimit < total,
    },
  };
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
      { new: true }
    ).select("likeCount");
    return { liked: false, likeCount: Math.max(0, updated?.likeCount ?? 0) };
  }

  await Like.create({ post: postId, user: userId });
  const updated = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likeCount: 1 } },
    { new: true }
  ).select("likeCount");

  // Fire-and-forget push to the post author
  void createAndSendNotification(
    post.author.toString(),
    userId,
    "like",
    postId
  );

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
  const post = await Post.findById(postId).select("author");
  if (!post) {
    throw new AppError("Post not found.", 404);
  }

  const [comment] = await Promise.all([
    Comment.create({ post: postId, author: authorId, content: dto.content }),
    Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
  ]);

  await comment.populate("author", "id username name avatar avatarUrl verified");

  // Fire-and-forget push to the post author
  void createAndSendNotification(
    post.author.toString(),
    authorId,
    "comment",
    postId
  );

  return comment;
};
