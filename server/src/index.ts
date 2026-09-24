import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import agentRoutes from "./routes/agents";
import propertyRoutes from "./routes/properties";
import { errorHandler } from "./middleware/errorHandler";
import * as store from "./store/agentStore";
import * as propertyStore from "./store/propertyStore";

const app = express();
const port = Number(process.env.PORT) || 3000;

store.seed();
propertyStore.seed(store.list()[0]);

app.use(cors());
app.use(express.json());

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  const jsonError = err as { status?: number; body?: unknown };
  if (err instanceof SyntaxError && jsonError.status === 400 && "body" in jsonError) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Request body must be valid JSON" },
    });
  }
  next(err);
});

app.use("/api/agents", agentRoutes);
app.use("/api/properties", propertyRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Property agent API listening on http://localhost:${port}`);
});
