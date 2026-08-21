import type { RequestHandler } from "express";
import { login, register } from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const registerController: RequestHandler = async (request, response, next) => { try { sendSuccess(response, await register(request.body), 201); } catch (error) { next(error); } };
export const loginController: RequestHandler = async (request, response, next) => { try { sendSuccess(response, await login(request.body.email, request.body.password)); } catch (error) { next(error); } };
