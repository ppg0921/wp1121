import { z } from "zod";

export const authSchema = z.object({
  // Sign in doesn't require a username, but sign up does.
  username: z.string(),
  // Passwords must be at least 8 characters long.
  password: z.string().min(1),
});
