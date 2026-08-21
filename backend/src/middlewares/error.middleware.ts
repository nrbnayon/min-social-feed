import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/api-response.js";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  // Known application error (AuthError, AppError, or any subclass)
  if (error instanceof AppError) {
    return sendError(response, error.message, error.statusCode);
  }

  // Mongoose duplicate key error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return sendError(
      response,
      `An account with this ${field} already exists.`,
      409
    );
  }

  // Mongoose schema validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e: any) => e.message);
    return sendError(response, messages[0] || "Validation failed.", 400, messages);
  }

  // Malformed JSON body
  if (error instanceof SyntaxError && "body" in error) {
    return sendError(response, "Invalid JSON in request body.", 400);
  }

  // Unexpected server errors
  logger.error("[Server Error]", error);
  return sendError(
    response,
    error instanceof Error ? error.message : "An unexpected server error occurred.",
    500
  );
};
