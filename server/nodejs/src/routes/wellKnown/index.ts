import { Elysia } from "elysia";
import { getPublicJwk } from "@/lib/keys";

export const WellKnownPlugin = new Elysia().get(
  "/.well-known/jwks.json",
  async () => {
    const key = await getPublicJwk();
    return { keys: [key] };
  }
);
