import { z } from 'zod';

export const searchRequestSchema = z.object({
  question: z.string().trim().min(1, 'Question is required.'),
});

export type SearchRequestBody = z.infer<typeof searchRequestSchema>;
