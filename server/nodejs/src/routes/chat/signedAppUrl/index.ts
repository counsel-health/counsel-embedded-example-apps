import { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { getBody } from "../../../lib/http";
import { getUser } from "../../../db/actions/getUser";
import { getCounselSignedAppUrl } from "../../../lib/counsel";

const SignedAppUrlBodySchema = z.object({
  userId: z.string(),
});

type SignedAppUrlBody = z.infer<typeof SignedAppUrlBodySchema>;

async function processRequest(data: SignedAppUrlBody) {
  // 1. Check the user exists
  const user = await getUser(data.userId);

  // 2. Call the Counsel API to get the signed app url
  const { url } = await getCounselSignedAppUrl(user.counsel_user_id);

  return { statusCode: 200, data: { url } };
}

export default async function index(req: IncomingMessage, res: ServerResponse) {
  const body = await getBody(req);
  if (!body) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Missing request body" }));
    return;
  }
  const result = SignedAppUrlBodySchema.safeParse(body);
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
