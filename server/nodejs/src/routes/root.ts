import { Request, Response, Router } from "express";

const router = Router();

/**
 * @description Returns a welcome message
 * @route GET /
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Example Counsel Node.js server!" });
});

export default router;
