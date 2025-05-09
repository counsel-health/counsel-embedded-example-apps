import { Router } from "express";
import signedAppUrlRoute from "./signedAppUrl";
import userRoute from "./user";

const router = Router();

/**
 * @description Get the signed app url for the user
 * @route POST /chat/signedAppUrl
 */
router.post("/signedAppUrl", signedAppUrlRoute);

/**
 * @description Create a user
 * @route POST /chat/user
 */
router.post("/user", userRoute);

export default router;
