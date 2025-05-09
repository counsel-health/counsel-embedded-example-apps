import { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { getBody } from "../../../lib/http";
import { createUser } from "../../../db/actions/createUser";
import { getDb } from "../../../db/db";

const UserBodySchema = z.object({
  userId: z.string(),
});

type UserBody = z.infer<typeof UserBodySchema>;

async function processRequest(data: UserBody) {
  // 1. Create a user in the DB + Counsel app
  const db = await getDb();
  await createUser(db, data.userId);

  return { statusCode: 200, data: { userId: data.userId } };
}

export default async function index(req: IncomingMessage, res: ServerResponse) {
  const body = await getBody(req);
  if (!body) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Missing request body" }));
    return;
  }
  const result = UserBodySchema.safeParse(body);
  if (!result.success) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: "Invalid request body",
        details: result.error.format(),
      })
    );
    return;
  }

  try {
    const { statusCode, data } = await processRequest(result.data);
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error("Error", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: "Internal Server Error",
        // Normally you wouldn't want to expose the error message to the client but its useful for debugging in the demo app
        details: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}
