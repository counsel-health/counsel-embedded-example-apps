import { Router } from "express";
import RootRouter from "./root";
import HealthCheckRouter from "./health";
import UserRouter from "./user/userRoutes";
import OnCounselWebhookRouter from "./onCounselWebhook";

const router: Router = Router();

router.use("/", RootRouter);
router.use("/user", UserRouter);
router.use("/health", HealthCheckRouter);
router.use("/onCounselWebhook", OnCounselWebhookRouter);

export const MainRouter: Router = router;
