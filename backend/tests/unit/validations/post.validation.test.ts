import { createPostSchema } from "../../../src/validations/post.validation.js";
import { createCommentSchema } from "../../../src/validations/comment.validation.js";

describe("Post and Comment Validation Schemas", () => {
  describe("createPostSchema", () => {
    it("should accept valid post content", () => {
      const result = createPostSchema.safeParse({
        content: "Hello world! This is my first post.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty post content", () => {
      const result = createPostSchema.safeParse({ content: "   " });
      expect(result.success).toBe(false);
    });

    it("should reject content longer than 2000 characters", () => {
      const result = createPostSchema.safeParse({
        content: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createCommentSchema", () => {
    it("should accept valid comment content", () => {
      const result = createCommentSchema.safeParse({
        content: "Nice post!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty comment content", () => {
      const result = createCommentSchema.safeParse({ content: "" });
      expect(result.success).toBe(false);
    });

    it("should reject content longer than 500 characters", () => {
      const result = createCommentSchema.safeParse({
        content: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
