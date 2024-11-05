import express from "express";
import { Model } from "objection";
import { setupCronJobs } from "./cron/currencyUpdate";
import authRoutes from "./routes/api/auth";
import currencyRoutes from "./routes/api/currencies";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { db, env, swaggerConfig } from "./config/index";
import swaggerUi from "swagger-ui-express";

// Model.knex(db);

const app = express();

(async () => {
  app.use(express.json());
  const limiter = await rateLimiter;
  app.use(limiter);

  app.use("/api/auth", authRoutes);
  app.use("/api/currencies", currencyRoutes);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));
  app.use(errorHandler);

  setupCronJobs();

  const API_PORT = env.API_PORT || 3000;
  app.listen(API_PORT, () => {
    console.log(`Server running on port ${API_PORT}`);
  });
})();

export default app;
