import { Router } from "express";
import { commentPost, createPostController, getPosts, likePost } from "../controllers/post.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createPostSchema } from "../validations/post.validation.js";
import { createCommentSchema } from "../validations/comment.validation.js";

export const postRoutes = Router();
postRoutes.get("/", getPosts);
postRoutes.post("/", requireAuth, validate(createPostSchema), createPostController);
postRoutes.post("/:id/like", requireAuth, likePost);
postRoutes.post("/:id/comments", requireAuth, validate(createCommentSchema), commentPost);
postRoutes.post("/:id/comment", requireAuth, validate(createCommentSchema), commentPost);
