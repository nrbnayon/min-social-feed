import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { Comment } from "../models/Comment.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/app-error.js";
import { pagination } from "../utils/pagination.js";
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
    // If the username doesn't exist return an empty list — don't 404
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

/**
 * Creates a new post and returns it with the author populated.
 */
export const createPost = async (
  authorId: string,
  dto: CreatePostDTO
): Promise<PostDocument> => {
  const post = await Post.create({
    author: authorId,
    content: dto.content,
    images: dto.images ?? [],
  });

  // Populate author so the response includes name/avatar
  await post.populate("author", "id username name avatar avatarUrl verified");
  return post;
};

// ─── Toggle Like ──────────────────────────────────────────────────────────────

/**
 * Toggles a like on a post. Creates it if absent, removes it if present.
 * Updates the denormalized `likeCount` counter on the post atomically.
 */
export const toggleLike = async (
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const post = await Post.findById(postId).select("likeCount");
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
  return { liked: true, likeCount: updated?.likeCount ?? 1 };
};

// ─── Add Comment ──────────────────────────────────────────────────────────────

/**
 * Adds a comment to a post. Validates post existence first.
 * Updates the denormalized `commentCount` counter on the post atomically.
 */
export const addComment = async (
  postId: string,
  authorId: string,
  dto: CreateCommentDTO
): Promise<CommentDocument> => {
  const postExists = await Post.exists({ _id: postId });
  if (!postExists) {
    throw new AppError("Post not found.", 404);
  }

  const [comment] = await Promise.all([
    Comment.create({ post: postId, author: authorId, content: dto.content }),
    Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
  ]);

  await comment.populate("author", "id username name avatar avatarUrl verified");
  return comment;
};
