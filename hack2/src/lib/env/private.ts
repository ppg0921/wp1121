import { z } from "zod";

const privateEnvSchema = z.object({
  // TODO: 1.2 Add your private environment variables here for your database (postgres)
  // TODO: 1.2 end
  POSTGRES_URL: z.string().url(),
  // PUSHER_ID: z.string(),
  // PUSHER_SECRET: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  // TODO: 1.3 Add your private environment variables here for your database (postgres)
  // TODO: 1.3 end
  POSTGRES_URL: process.env.POSTGRES_URL!,
  // PUSHER_ID: process.env.PUSHER_ID!,
  // PUSHER_SECRET: process.env.PUSHER_SECRET!,
};

privateEnvSchema.parse(privateEnv);
