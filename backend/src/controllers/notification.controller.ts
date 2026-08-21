import type { RequestHandler } from "express";
import { sendSuccess } from "../utils/api-response.js";

export const getNotifications: RequestHandler = async (_request, response) => sendSuccess(response, []);
