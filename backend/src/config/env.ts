import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_EMBED_MODEL: z.string().min(1).default('nomic-embed-text'),
  OLLAMA_CHAT_MODEL: z.string().min(1).default('llama3.2'),
  QDRANT_URL: z.string().url().default('http://localhost:6333'),
  QDRANT_COLLECTION_NAME: z.string().min(1).default('pdf_chunks'),
  CHUNK_SIZE: z.coerce.number().int().positive().default(800),
  CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(150),
  UPLOAD_DIR: z.string().min(1).default('./tmp/uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(20),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadEnvConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error('Invalid environment variables:', formatted);
    process.exit(1);
  }

  return result.data;
}
