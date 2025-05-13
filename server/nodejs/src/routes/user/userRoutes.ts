import { Router } from "express";
import signUpRouter from "./signUp";
import signOutRouter from "./signOut";
import signedAppUrlRouter from "./signedAppUrl";
import { verifyJWTSession } from "@/lib/user-session";

const router = Router();

router.post("/signUp", signUpRouter);
router.post("/signOut", verifyJWTSession, signOutRouter);
router.post("/signedAppUrl", verifyJWTSession, signedAppUrlRouter);

export default router;
