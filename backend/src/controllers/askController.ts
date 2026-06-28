import type { NextFunction, Request, Response } from 'express';
import { askService } from '../services/askService.js';
import type { IAskService } from '../interfaces/IAskService.js';
import { searchRequestSchema } from '../validators/searchValidator.js';
import { AppError } from '../types/errors.js';

export class AskController {
  constructor(private readonly service: IAskService = askService) {}

  async handleAsk(req: Request, res: Response): Promise<void> {
    const parsed = searchRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid request body';
      throw new AppError(400, message);
    }

    const result = await this.service.ask(parsed.data.question);

    res.status(200).json({
      status: 'success',
      ...result,
    });
  }
}

export const askController = new AskController();

export function handleAsk(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  askController.handleAsk(req, res).catch(next);
}
