import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/api-response.js";
import { AuthError } from "../services/auth.service.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  // If it's a known AuthError
  if (error instanceof AuthError) {
    return sendError(response, error.message, error.statusCode);
  }

  // Handle Mongoose duplicate key error (11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return sendError(
      response,
      `An account with this ${field} already exists.`,
      409
    );
  }

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {}).map((e: any) => e.message);
    return sendError(response, messages[0] || "Validation failed", 400, messages);
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && "body" in error) {
    return sendError(response, "Invalid JSON payload in request body", 400);
  }

  console.error("Unhandled Server Error:", error);
  return sendError(
    response,
    error instanceof Error ? error.message : "An unexpected server error occurred",
    500
  );
};
