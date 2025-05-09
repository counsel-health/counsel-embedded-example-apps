import express from "express";
import { Application } from "express";
import bodyParser from "body-parser";
import { MainRouter } from "@/routes";
import helmet from "helmet";
import { handleErrors } from "@/lib/error-handling";
import observabilityMiddleware from "@/lib/observability";

const app: Application = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(observabilityMiddleware);
app.use(MainRouter);

handleErrors(app);

export default app;
