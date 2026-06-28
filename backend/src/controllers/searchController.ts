import type { NextFunction, Request, Response } from 'express';
import type { ISearchService } from '../interfaces/ISearchService.js';
import { searchService } from '../services/searchService.js';
import { searchRequestSchema } from '../validators/searchValidator.js';
import { AppError } from '../types/errors.js';

export class SearchController {
  constructor(private readonly service: ISearchService = searchService) {}

  async handleSearch(req: Request, res: Response): Promise<void> {
    const parsed = searchRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid request body';
      throw new AppError(400, message);
    }

    const result = await this.service.search(parsed.data.question);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  }
}

export const searchController = new SearchController();

export function handleSearch(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  searchController.handleSearch(req, res).catch(next);
}
