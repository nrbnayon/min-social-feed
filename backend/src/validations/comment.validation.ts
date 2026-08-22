import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(500),
  parentId: z.string().optional(),
  replyTo: z.string().optional(),
});
