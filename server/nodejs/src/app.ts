import express from "express";
import { Application } from "express";
import bodyParser from "body-parser";
import { MainRouter } from "@/routes";
import helmet from "helmet";
import { handleErrors } from "@/lib/error-handling";
import observabilityMiddleware from "@/lib/observability";

const app: Application = express();

// CORS — allow the Next.js app (different port) to call the demo server directly
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(observabilityMiddleware);
app.use(MainRouter);

handleErrors(app);

export default app;
