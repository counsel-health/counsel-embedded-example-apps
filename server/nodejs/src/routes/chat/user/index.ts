import { z } from "zod";
import { parseBody } from "@/lib/http";
import { createUser } from "@/db/actions/createUser";
import { NextFunction, Request, Response } from "express";

const UserBodySchema = z.object({
  userId: z.string(),
});

export default async function index(req: Request, res: Response, _next: NextFunction) {
  const body = await parseBody(req, UserBodySchema);

  await createUser(body.userId);

  res.status(200).json({ userId: body.userId });
}
