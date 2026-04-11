import { Webhook } from "standardwebhooks";
import { HttpError } from "./http";

export function verifyWebhook(
  secret: string,
  body: unknown,
  headers: Record<string, string | string[] | undefined>
) {
  const wh = new Webhook(secret);
  try {
    wh.verify(JSON.stringify(body), headers as Record<string, string>);
    return true;
  } catch (error) {
    console.error("Webhook verification failed", error);
    // Return 400 if the webhook verification fails
    throw new HttpError("Invalid webhook signature or timestamp", 400);
  }
}
