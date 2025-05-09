import { Application, NextFunction, Request, Response } from "express";
import { HttpError, isHttpError } from "./http";

export function handleErrors(app: Application) {
  // catch 404 errors and forward to error handler
  app.use((_req, _res, next) => {
    next(new HttpError("Not Found", 404));
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unexpected error caught", err);
    if (isHttpError(err)) {
      res.status(err.status);
    } else {
      res.status(500);
    }

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}
