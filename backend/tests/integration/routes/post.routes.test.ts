import request from "supertest";
import { app } from "../../../src/app.js";

describe("Post Routes (Integration)", () => {
  describe("POST /api/posts", () => {
    it("should return 401 Unauthorized when unauthenticated user creates a post", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({ content: "Hello world!" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/posts/:id/like", () => {
    it("should return 401 Unauthorized when unauthenticated user likes a post", async () => {
      const response = await request(app)
        .post("/api/posts/60d0fe4f5311236168a109ca/like");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/posts/:id/comments", () => {
    it("should return 401 Unauthorized when unauthenticated user comments", async () => {
      const response = await request(app)
        .post("/api/posts/60d0fe4f5311236168a109ca/comments")
        .send({ content: "Great post!" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
