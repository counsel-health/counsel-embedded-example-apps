import { Elysia } from "elysia";
import { z } from "zod";
import { getPublicJwk } from "@/lib/keys";

export const WellKnownPlugin = new Elysia().get(
  "/.well-known/jwks.json",
  async () => {
    const key = await getPublicJwk();
    return { keys: [key] };
  },
  { response: z.object({ keys: z.array(z.record(z.string(), z.unknown())) }) }
);
