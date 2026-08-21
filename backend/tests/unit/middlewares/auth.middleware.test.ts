import { requireAuth } from "../../../src/middlewares/auth.middleware.js";
import { User } from "../../../src/models/User.js";
import * as jwtUtils from "../../../src/utils/jwt.js";
import type { Request, Response, NextFunction } from "express";

jest.mock("../../../src/models/User.js");

describe("Auth Middleware (requireAuth)", () => {
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
    mockReq = {
      headers: {},
    };
    nextFn = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 401 if Authorization header is missing", async () => {
    mockReq.headers = {};

    await requireAuth(mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header does not start with Bearer", async () => {
    mockReq.headers = { authorization: "Basic 12345" };

    await requireAuth(mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it("should return 401 if token payload has no userId", async () => {
    mockReq.headers = { authorization: "Bearer valid-format-token" };
    jest.spyOn(jwtUtils, "verifyAccessToken").mockReturnValue({} as any);

    await requireAuth(mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it("should return 401 if user does not exist in DB", async () => {
    mockReq.headers = { authorization: "Bearer valid-token" };
    jest.spyOn(jwtUtils, "verifyAccessToken").mockReturnValue({ userId: "123" } as any);
    (User.findById as jest.Mock).mockResolvedValue(null);

    await requireAuth(mockReq as Request, mockRes as Response, nextFn);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it("should attach user to request and call next() on valid token and existing user", async () => {
    const mockUser = { _id: "123", id: "123", email: "user@example.com" };
    mockReq.headers = { authorization: "Bearer valid-token" };
    jest.spyOn(jwtUtils, "verifyAccessToken").mockReturnValue({ userId: "123" } as any);
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    await requireAuth(mockReq as Request, mockRes as Response, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect((mockReq as any).user).toEqual(mockUser);
  });
});
