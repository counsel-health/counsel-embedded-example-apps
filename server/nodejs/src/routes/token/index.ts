import { signCounselJwt } from "@/lib/keys";
import { isAuthenticatedRequest, verifyJWTSession } from "@/lib/user-session";
import { getAccessCodeConfig } from "@/envConfig";
import { Router } from "express";
const router = Router();

// Returns a short-lived Counsel JWT for the authenticated user.
// The Next.js app uses this to call Counsel APIs directly.
router.post("/", verifyJWTSession, async (req, res) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const config = getAccessCodeConfig(req.user.accessCode);
  if (!config) {
    res.status(400).json({ error: "Invalid access code" });
    return;
  }
  if (!config.issuer) {
    res.status(400).json({
      error:
        "This access code uses API key auth. Use the server's /user/signedAppUrl endpoint instead of /token.",
    });
    return;
  }
  const jwt = await signCounselJwt(req.user.userId, config.issuer);
  res.json({ token: jwt });
});

export default router;
