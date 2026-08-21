import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/api-response.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  sendError(response, error instanceof Error ? error.message : "Internal server error");
};
