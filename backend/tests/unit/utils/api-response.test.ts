import { sendSuccess, sendError } from "../../../src/utils/api-response.js";
import type { Response } from "express";

describe("API Response Utilities", () => {
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockImplementation((val) => val);
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock as any,
    };
  });

  describe("sendSuccess", () => {
    it("should format success response with default message and 200 status", () => {
      const data = { id: "123", name: "Test" };
      sendSuccess(mockResponse as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Operation successful",
        data,
      });
    });

    it("should allow custom message and status code", () => {
      const data = { id: "123" };
      sendSuccess(mockResponse as Response, data, "Created successfully", 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Created successfully",
        data,
      });
    });

    it("should support numeric second argument as status code", () => {
      const data = { id: "123" };
      sendSuccess(mockResponse as Response, data, 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Operation successful",
        data,
      });
    });
  });

  describe("sendError", () => {
    it("should format error response with default status 500", () => {
      sendError(mockResponse as Response, "Something went wrong");

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Something went wrong",
        },
      });
    });

    it("should include error details when provided", () => {
      const details = [{ field: "email", message: "Invalid email" }];
      sendError(mockResponse as Response, "Validation failed", 400, details);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Validation failed",
          details,
        },
      });
    });
  });
});
