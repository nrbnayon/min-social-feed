import { logger } from "../../../src/utils/logger.js";

describe("Dynamic Logger Utility", () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("Development mode (pretty console format)", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      delete process.env.LOG_FORMAT;
    });

    it("should log info messages to console.log", () => {
      logger.info("Server started");
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain("[INFO]");
      expect(logSpy.mock.calls[0][0]).toContain("Server started");
    });

    it("should log warn messages to console.warn", () => {
      logger.warn("High memory warning");
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain("[WARN]");
      expect(warnSpy.mock.calls[0][0]).toContain("High memory warning");
    });

    it("should log error messages to console.error", () => {
      logger.error("DB failed", new Error("Connection refused"));
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain("[ERROR]");
      expect(errorSpy.mock.calls[0][0]).toContain("Connection refused");
    });
  });

  describe("Production mode (structured JSON format)", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
      delete process.env.LOG_FORMAT;
    });

    it("should output valid JSON in production mode", () => {
      logger.info("Production event", { userId: "123", action: "login" });

      expect(logSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(logSpy.mock.calls[0][0]);

      expect(parsed).toMatchObject({
        level: "info",
        message: "Production event",
        environment: "production",
        meta: { userId: "123", action: "login" },
      });
      expect(parsed.timestamp).toBeDefined();
    });

    it("should output structured error JSON when error object passed", () => {
      const err = new Error("Database timeout");
      logger.error("Query failed", err);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);

      expect(parsed).toMatchObject({
        level: "error",
        message: "Query failed",
        environment: "production",
        error: {
          name: "Error",
          message: "Database timeout",
        },
      });
      expect(parsed.error.stack).toBeDefined();
    });
  });

  describe("Log level filtering", () => {
    it("should suppress debug and http logs when LOG_LEVEL=warn", () => {
      process.env.LOG_LEVEL = "warn";

      logger.debug("Debug msg");
      logger.http("HTTP msg");
      logger.info("Info msg");

      expect(logSpy).not.toHaveBeenCalled();

      logger.warn("Warn msg");
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });
});
