import { Webhook } from "standardwebhooks";
import { HttpError } from "./http";
import { IncomingHttpHeaders } from "http";

export function verifyWebhook(secret: string, body: unknown, headers: IncomingHttpHeaders) {
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
