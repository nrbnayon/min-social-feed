import type { RequestHandler } from "express";
import { listPosts, getPostById, createPost, toggleLike, addComment } from "../services/post.service.js";
import { sendSuccess } from "../utils/api-response.js";

// ─── GET /api/posts ────────────────────────────────────────────────────────────

/**
 * List posts with optional username filter and pagination.
 * Query params: ?page=1&limit=20&username=jordan
 */
export const getPosts: RequestHandler = async (request, response, next) => {
  try {
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 20;
    const username = request.query.username as string | undefined;

    const result = await listPosts(page, limit, username);
    return sendSuccess(response, result, "Posts fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/posts/:id ────────────────────────────────────────────────────────

/**
 * Get a single post by ID with all likes and comments.
 */
export const getPostByIdController: RequestHandler = async (request, response, next) => {
  try {
    const post = await getPostById(String(request.params.id));
    return sendSuccess(response, { post }, "Post fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/posts ───────────────────────────────────────────────────────────

/**
 * Create a new post for the authenticated user.
 */
export const createPostController: RequestHandler = async (request, response, next) => {
  try {
    const authorId = request.user!._id.toString();
    const post = await createPost(authorId, {
      content: request.body.content,
      images: request.body.images,
    });
    return sendSuccess(response, { post }, "Post created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/posts/:id/like ──────────────────────────────────────────────────

/**
 * Toggle like on a post. Returns the new like state and updated count.
 */
export const likePost: RequestHandler = async (request, response, next) => {
  try {
    const postId = String(request.params.id);
    const userId = request.user!._id.toString();
    const result = await toggleLike(postId, userId);
    const message = result.liked ? "Post liked." : "Post unliked.";
    return sendSuccess(response, result, message, 200);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/posts/:id/comments ─────────────────────────────────────────────

/**
 * Add a comment to a post for the authenticated user.
 */
export const commentPost: RequestHandler = async (request, response, next) => {
  try {
    const postId = String(request.params.id);
    const authorId = request.user!._id.toString();
    const comment = await addComment(postId, authorId, {
      content: request.body.content,
      parentId: request.body.parentId,
      replyTo: request.body.replyTo,
    });
    return sendSuccess(response, { comment }, "Comment added.", 201);
  } catch (error) {
    next(error);
  }
};
