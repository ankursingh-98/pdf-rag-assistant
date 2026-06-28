import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { apiRoutes } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
