import { Router } from "express";
import RootRouter from "./root";
import ChatRouter from "./chat/chatRoutes";
import HealthCheckRouter from "./health";
import { authenticateBearerToken } from "@/lib/authentication";
import UserRouter from "./user/userRoutes";
const router: Router = Router();

router.use("/", RootRouter);
router.use("/chat", [authenticateBearerToken], ChatRouter);
router.use("/user", UserRouter);
router.use("/health", HealthCheckRouter);

export const MainRouter: Router = router;
