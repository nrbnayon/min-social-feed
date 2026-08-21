import { validate } from "../../../src/middlewares/validation.middleware.js";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

describe("Validation Middleware", () => {
  const schema = z.object({
    title: z.string().min(3, "Title too short"),
  });

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
    nextFn = jest.fn();
  });

  it("should call next() and attach parsed data if input is valid", () => {
    mockReq = {
      body: { title: "Hello World" },
    };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, nextFn);

    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(mockReq.body).toEqual({ title: "Hello World" });
  });

  it("should return 400 with validation message if input is invalid", () => {
    mockReq = {
      body: { title: "Hi" },
    };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: "Title too short",
      },
    });
  });
});
