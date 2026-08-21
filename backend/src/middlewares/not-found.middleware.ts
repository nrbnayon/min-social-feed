import type { RequestHandler } from "express";
import { sendError } from "../utils/api-response.js";

export const notFoundMiddleware: RequestHandler = (request, response) => {
  sendError(response, `Route not found: ${request.method} ${request.path}`, 404);
};
