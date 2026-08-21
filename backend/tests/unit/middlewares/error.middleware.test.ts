import { errorMiddleware } from "../../../src/middlewares/error.middleware.js";
import { AppError, AuthError } from "../../../src/utils/app-error.js";
import type { Request, Response, NextFunction } from "express";

describe("Error Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockImplementation((d) => d);
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock as any,
    };
    mockReq = {};
    nextFn = jest.fn();
  });

  it("should handle custom AppError and send custom status code", () => {
    const error = new AppError("Resource not found", 404);
    errorMiddleware(error, mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "Resource not found",
      },
    });
  });

  it("should handle AuthError correctly", () => {
    const error = new AuthError("Unauthorized access", 401);
    errorMiddleware(error, mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "Unauthorized access",
      },
    });
  });

  it("should handle MongoDB duplicate key error code 11000", () => {
    const mongoError: any = new Error("E11000 duplicate key error");
    mongoError.code = 11000;
    mongoError.keyPattern = { email: 1 };

    errorMiddleware(mongoError, mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "An account with this email already exists.",
      },
    });
  });

  it("should handle generic 500 server error", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Unexpected database crash");

    errorMiddleware(error, mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "Unexpected database crash",
      },
    });
    spy.mockRestore();
  });
});
