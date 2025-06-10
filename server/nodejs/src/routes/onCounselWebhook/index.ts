import { env } from "@/envConfig";
import { verifyWebhook } from "@/lib/webhook-verification";
import { Router } from "express";

const router = Router();

/**
 * @description Webhooks
 * @route POST /webhooks
 */
router.post("/", (req, res) => {
  // Verify the webhook signature using the standardwebhooks library
  verifyWebhook(env.COUNSEL_WEBHOOK_SECRET, req.body, req.headers);

  // Process the webhook
  console.log("Webhook received", req.body);

  // Return back 200 to the webhook sender to ack
  res.status(200).json({ message: "ok" });
});

export default router;
