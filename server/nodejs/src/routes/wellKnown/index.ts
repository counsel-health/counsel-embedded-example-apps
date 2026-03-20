import { getPublicJwk } from "@/lib/keys";
import { Router } from "express";

const router = Router();

router.get("/jwks.json", async (_req, res) => {
  const key = await getPublicJwk();
  res.json({ keys: [key] });
});

export default router;
