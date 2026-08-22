import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { Comment } from "../models/Comment.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/app-error.js";
import { pagination } from "../utils/pagination.js";
import { createAndSendNotification } from "./notification.service.js";
import { emitPostLiked, emitPostCommented } from "./socket.service.js";
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
      .populate("replyTo", "id username name avatar avatarUrl")
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
      .populate("replyTo", "id username name avatar avatarUrl")
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
    // 1. Delete Like document from DB
    await Like.findOneAndDelete({ post: postId, user: userId });

    // 2. Also remove any dangling like notification from DB
    await Notification.deleteMany({ post: postId, sender: userId, type: "like" });

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: -1 } },
      { returnDocument: "after" }
    ).select("likeCount");
    const count = Math.max(0, updated?.likeCount ?? 0);
    emitPostLiked({ postId, liked: false, likeCount: count, userId });
    return { liked: false, likeCount: count };
  }

  await Like.create({ post: postId, user: userId });
  const updated = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likeCount: 1 } },
    { returnDocument: "after" }
  ).select("likeCount");
  const count = updated?.likeCount ?? 1;

  emitPostLiked({ postId, liked: true, likeCount: count, userId });

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

  return { liked: true, likeCount: count };
};

// ─── Add Comment / Reply ──────────────────────────────────────────────────────

/**
 * Adds a comment or a threaded reply to a post.
 * If this is a reply to another comment, fires a targeted notification to the
 * parent comment author. Also notifies the post author if different.
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

  // Resolve parent comment author if this is a reply
  let parentCommentAuthorId: string | null = null;
  if (dto.parentId && mongoose.Types.ObjectId.isValid(dto.parentId)) {
    const parentComment = await Comment.findById(dto.parentId).select("author");
    if (parentComment) {
      parentCommentAuthorId = (parentComment.author?._id ?? parentComment.author)?.toString() ?? null;
    }
  }

  // Resolve replyTo user ID (accepts ObjectId, username, or parentComment author fallback)
  let resolvedReplyToUserId: string | null = null;
  if (dto.replyTo) {
    if (mongoose.Types.ObjectId.isValid(dto.replyTo)) {
      resolvedReplyToUserId = dto.replyTo;
    } else {
      const u = await User.findOne({ username: dto.replyTo.replace(/^@/, "") }).select("_id");
      if (u) resolvedReplyToUserId = u._id.toString();
    }
  }

  if (!resolvedReplyToUserId && parentCommentAuthorId) {
    resolvedReplyToUserId = parentCommentAuthorId;
  }

  // If still not resolved, check if content starts with an @mention
  if (!resolvedReplyToUserId) {
    const mentionMatch = dto.content.match(/^@([a-zA-Z0-9_.-]+)/);
    if (mentionMatch) {
      const mentionedUsername = mentionMatch[1];
      const u = await User.findOne({ username: mentionedUsername }).select("_id");
      if (u) resolvedReplyToUserId = u._id.toString();
    }
  }

  const [comment, updatedPost] = await Promise.all([
    Comment.create({
      post: postId,
      author: authorId,
      content: dto.content,
      parentId: dto.parentId || null,
      replyTo: resolvedReplyToUserId || null,
    }),
    Post.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { returnDocument: "after" }
    ).select("commentCount"),
  ]);

  await comment.populate([
    { path: "author", select: "id username name avatar avatarUrl verified" },
    { path: "replyTo", select: "id username name avatar avatarUrl" },
  ]);

  // Emit real-time comment event to all connected clients
  emitPostCommented({
    postId,
    comment: comment.toObject(),
    commentCount: updatedPost?.commentCount ?? 1,
  });

  const actorId = String(authorId);
  const postAuthorId = (post.author?._id ?? post.author)?.toString();

  // 1. If replying to someone's comment (and not self-reply), send a targeted "replied to your comment" notification!
  const targetRecipientId = resolvedReplyToUserId || parentCommentAuthorId;
  if (targetRecipientId && targetRecipientId !== actorId) {
    void createAndSendNotification(
      targetRecipientId,
      actorId,
      "comment",
      postId,
      { subType: "reply", commentSnippet: dto.content }
    );
  }

  // 2. Also notify post author if they are not the commenter AND not already notified as targetRecipient
  if (
    postAuthorId &&
    postAuthorId !== actorId &&
    postAuthorId !== targetRecipientId
  ) {
    void createAndSendNotification(
      postAuthorId,
      actorId,
      "comment",
      postId,
      { subType: "comment", commentSnippet: dto.content }
    );
  }

  return comment;
};
