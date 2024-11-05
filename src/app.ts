import express from 'express';
import { Model } from 'objection';
import { setupCronJobs } from './cron/currencyUpdate';
import authRoutes from './routes/api/auth';
import currencyRoutes from './routes/api/currencies';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { db, env, swaggerConfig } from './config/index';
import swaggerUi from 'swagger-ui-express';


Model.knex(db);

const app = express();
app.use(express.json());
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use(errorHandler);

setupCronJobs();

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;