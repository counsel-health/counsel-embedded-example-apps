import { Router } from "express";
import RootRouter from "./root";
import HealthCheckRouter from "./health";
import UserRouter from "./user/userRoutes";
import OnCounselWebhookRouter from "./onCounselWebhook";
import WellKnownRouter from "./wellKnown";
import TokenRouter from "./token";
const router: Router = Router();

router.use("/", RootRouter);
router.use("/user", UserRouter);
router.use("/health", HealthCheckRouter);
router.use("/onCounselWebhook", OnCounselWebhookRouter);
router.use("/.well-known", WellKnownRouter);
router.use("/token", TokenRouter);
export const MainRouter: Router = router;
