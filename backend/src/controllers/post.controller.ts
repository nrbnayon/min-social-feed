import type { RequestHandler } from "express";
import { addComment, createPost, listPosts, toggleLike } from "../services/post.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const getPosts: RequestHandler = async (request, response, next) => { try { sendSuccess(response, await listPosts(Number(request.query.page) || 1, Number(request.query.limit) || 20, request.query.username as string)); } catch (error) { next(error); } };
export const createPostController: RequestHandler = async (request, response, next) => { try { sendSuccess(response, await createPost(request.user!._id.toString(), request.body.content), 201); } catch (error) { next(error); } };
export const likePost: RequestHandler = async (request, response, next) => { try { sendSuccess(response, await toggleLike(String(request.params.id), request.user!._id.toString())); } catch (error) { next(error); } };
export const commentPost: RequestHandler = async (request, response, next) => { try { sendSuccess(response, await addComment(String(request.params.id), request.user!._id.toString(), request.body.content), 201); } catch (error) { next(error); } };
