import { IncomingMessage, ServerResponse } from "node:http";

export default function index(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      message: "Welcome to the Example Counsel Node.js server!",
    })
  );
}
