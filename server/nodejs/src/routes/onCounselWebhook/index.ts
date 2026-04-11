import { Elysia } from "elysia";
import { z } from "zod";
import { env } from "@/envConfig";
import { verifyWebhook } from "@/lib/webhook-verification";
import { webhookLogger } from "@/lib/logger";

// Webhook payloads are JSON objects whose shape is defined by Counsel.
// We validate that it's a JSON record; signature verification handles authenticity.
const WebhookBodySchema = z.record(z.string(), z.unknown());

/**
 * @description Webhooks
 * @route POST /onCounselWebhook
 */
export const OnCounselWebhookPlugin = new Elysia().post(
  "/onCounselWebhook",
  ({ body, headers }) => {
    verifyWebhook(env.COUNSEL_WEBHOOK_SECRET, body, headers);
    webhookLogger.info({ body }, "Webhook received");
    return { message: "ok" };
  },
  {
    body: WebhookBodySchema,
    response: z.object({ message: z.string() }),
  }
);
