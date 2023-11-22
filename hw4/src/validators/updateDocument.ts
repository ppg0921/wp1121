import { z } from "zod";

export const updateDocSchema = z.object({
  content: z.string().array().optional(),
  pinnedMessage: z.string().array().optional(),
  lastMessage: z.string().optional(),
});
