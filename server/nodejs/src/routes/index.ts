import { Elysia } from "elysia";
import { RootPlugin } from "./root";
import { HealthPlugin } from "./health";
import { UserPlugin } from "./user/userRoutes";
import { OnCounselWebhookPlugin } from "./onCounselWebhook";
import { WellKnownPlugin } from "./wellKnown";
import { TokenPlugin } from "./token";

export const MainPlugin = new Elysia()
  .use(RootPlugin)
  .use(HealthPlugin)
  .use(UserPlugin)
  .use(OnCounselWebhookPlugin)
  .use(WellKnownPlugin)
  .use(TokenPlugin);
