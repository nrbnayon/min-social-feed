import type { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  response: Response,
  data: T,
  messageOrStatus: string | number = "Operation successful",
  status = 200
) => {
  let message = "Operation successful";
  let statusCode = status;

  if (typeof messageOrStatus === "number") {
    statusCode = messageOrStatus;
  } else if (typeof messageOrStatus === "string") {
    message = messageOrStatus;
  }

  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  response: Response,
  message = "An error occurred",
  status = 500,
  details?: any
) => {
  return response.status(status).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
};
