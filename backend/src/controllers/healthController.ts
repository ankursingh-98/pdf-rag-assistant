import type { Request, Response } from 'express';
import { config } from '../config/index.js';
import type { IHealthController } from '../interfaces/IHealthController.js';

export class HealthController implements IHealthController {
  getHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  }
}

export const healthController = new HealthController();
