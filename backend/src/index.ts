import { createApp } from './app.js';
import { config } from './config/index.js';
import { qdrantRepository } from './repositories/qdrantRepository.js';
import { logger } from './utils/logger.js';

const DEFAULT_VECTOR_SIZE = 768;

async function startServer(): Promise<void> {
  await qdrantRepository.ensureCollection(DEFAULT_VECTOR_SIZE);

  const app = createApp();

  const server = app.listen(config.PORT, () => {
    logger.info(`Server running on http://localhost:${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`Qdrant collection: ${config.QDRANT_COLLECTION_NAME}`);
  });

  function shutdown(signal: string): void {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error: Error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
