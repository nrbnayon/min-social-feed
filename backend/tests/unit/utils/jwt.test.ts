import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signToken,
  verifyToken,
} from "../../../src/utils/jwt.js";

describe("JWT Utilities", () => {
  const payload = {
    userId: "60d0fe4f5311236168a109ca",
    email: "test@example.com",
    username: "testuser",
  };

  it("should generate a valid access token and verify it", () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.username).toBe(payload.username);
  });

  it("should generate a valid refresh token and verify it", () => {
    const refreshPayload = { userId: payload.userId, tokenVersion: 1 };
    const token = generateRefreshToken(refreshPayload);
    expect(typeof token).toBe("string");

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.tokenVersion).toBe(1);
  });

  it("should support signToken and verifyToken backwards compatibility aliases", () => {
    const token = signToken({ userId: payload.userId });
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it("should throw error on invalid token", () => {
    expect(() => verifyAccessToken("invalid-token-string")).toThrow();
    expect(() => verifyRefreshToken("invalid-token-string")).toThrow();
  });
});
