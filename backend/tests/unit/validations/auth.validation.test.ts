import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  deviceTokenSchema,
} from "../../../src/validations/auth.validation.js";

describe("Auth Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should accept valid registration input", () => {
      const validData = {
        name: "Jane Doe",
        username: "janedoe",
        email: "jane@example.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid username with special characters", () => {
      const invalidData = {
        name: "Jane Doe",
        username: "jane@doe!",
        email: "jane@example.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = {
        name: "Jane Doe",
        username: "janedoe",
        email: "jane@example.com",
        password: "123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "Jane",
        username: "jane",
        email: "not-an-email",
        password: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login input", () => {
      const result = loginSchema.safeParse({
        email: "jane@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing password", () => {
      const result = loginSchema.safeParse({
        email: "jane@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("refreshTokenSchema", () => {
    it("should validate refresh token present", () => {
      expect(refreshTokenSchema.safeParse({ refreshToken: "token-abc" }).success).toBe(true);
      expect(refreshTokenSchema.safeParse({ refreshToken: "" }).success).toBe(false);
    });
  });

  describe("deviceTokenSchema", () => {
    it("should validate Expo push token format", () => {
      const valid = deviceTokenSchema.safeParse({
        expoPushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      });
      expect(valid.success).toBe(true);

      const invalid = deviceTokenSchema.safeParse({
        expoPushToken: "InvalidPushToken123",
      });
      expect(invalid.success).toBe(false);
    });
  });
});
