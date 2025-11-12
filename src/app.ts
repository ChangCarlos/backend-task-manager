import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import logger from "./logger";
import taskRoutes from "./routes/task.routes";
import userRoutes from "./routes/user.routes";
import errorHandler from "./middlewares/error.handler";
import { swaggerSpec } from "./config/swagger";
import { generalLimiter } from "./middlewares/rateLimiter";
import { requestIdMiddleware } from "./middlewares/requestId";

const app = express();

app.use(requestIdMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(generalLimiter);
}

app.use(
  morgan("custom", {
    stream: {
      write: (msg) =>
        logger.info(msg.trim(), { context: "http" }),
    },
  }),
);

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Tasks API Documentation",
  }),
);

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.use((_, res) => res.status(404).json({ message: "Not Found" }));

app.use(errorHandler);

export default app;
