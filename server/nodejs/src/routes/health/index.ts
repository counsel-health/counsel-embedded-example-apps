import { Router } from "express";

const router = Router();

/**
 * @description Check the server is running
 * @route GET /health
 */
router.get("/", (_req, res) => {
  res.status(200).json({ message: "ok" });
});

export default router;
