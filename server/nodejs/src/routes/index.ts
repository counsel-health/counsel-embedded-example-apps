import { Router } from "express";
import RootRouter from "./root";
import ChatRouter from "./chat/chatRoutes";
import HealthCheckRouter from "./health";
import { authenticateBearerToken } from "@/lib/authentication";

const router: Router = Router();

router.use("/", RootRouter);
router.use("/chat", [authenticateBearerToken], ChatRouter);
router.use("/health", HealthCheckRouter);

export const MainRouter: Router = router;
