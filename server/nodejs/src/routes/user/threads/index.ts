import { getOrCreateUser } from "../signedAppUrl";
import { getCounselUserThreads, createCounselThread } from "@/lib/counsel";
import type { User } from "@/lib/user-session";
import { z } from "zod";

/**
 * @description Get the user's chat threads from the Counsel API
 * @route GET /user/threads
 */
export async function threadsHandler({ user }: { user: User }) {
  const u = await getOrCreateUser(user.userId, user.accessCode);
  const threads = await getCounselUserThreads({
    userId: u.counsel_user_id,
    accessCode: user.accessCode,
  });
  return threads;
}

export const CreateThreadBodySchema = z.object({
  module: z.string().optional(),
  initial_messages: z
    .array(
      z.object({
        body: z.string(),
        role: z.enum(["patient", "model"]).optional(),
      })
    )
    .max(10)
    .optional(),
  agent_context: z.record(z.string(), z.unknown()).optional(),
});

export const CreateThreadResponseSchema = z.object({
  thread_id: z.string(),
  created_at: z.string(),
});

/**
 * @description Create a new thread for the user via the Counsel API
 * @route POST /user/threads
 */
export async function createThreadHandler({
  user,
  body,
}: {
  user: User;
  body: z.infer<typeof CreateThreadBodySchema>;
}) {
  const u = await getOrCreateUser(user.userId, user.accessCode);
  return await createCounselThread({
    userId: u.counsel_user_id,
    accessCode: user.accessCode,
    body,
  });
}
