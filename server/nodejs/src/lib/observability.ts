import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * @description Observability middleware
 * Tracks request & responses in logs
 */
export default function observabilityMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = uuidv4();

  // Log when the request starts
  console.info(`Incoming request - ${requestId}`, {
    method: req.method,
    path: "path" in req ? req.path : null,
    query: "query" in req ? JSON.stringify(req.query) : null,
    body: "body" in req ? req.body : null,
    ip: "ip" in req ? req.ip : null,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.info(`Request finished - ${requestId}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}
