import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { sendError } from "../utils/api-response.js";

export const validate = (schema: ZodType): RequestHandler => (request, response, next) => {
  const result = schema.safeParse(request.body);
  if (!result.success) return sendError(response, result.error.issues[0]?.message ?? "Invalid request", 400);
  request.body = result.data;
  next();
};
