import type { Response } from "express";

export const sendSuccess = <T>(response: Response, data: T, status = 200) =>
  response.status(status).json({ success: true, data });

export const sendError = (response: Response, message: string, status = 500) =>
  response.status(status).json({ success: false, error: { message } });
