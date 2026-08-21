import request from "supertest";
import { app } from "../../../src/app.js";

describe("Auth Routes (Integration)", () => {
  describe("POST /api/auth/register", () => {
    it("should return 400 when registration body is invalid", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "J",
          email: "invalid-email",
          username: "inv@lid!",
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 when login credentials are missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should return 400 when refresh token is missing", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 Unauthorized when no token is provided", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 Unauthorized when invalid token is provided", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-jwt-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
