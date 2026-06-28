import { Router } from 'express';
import { handleAsk } from '../controllers/askController.js';

const router = Router();

router.post('/ask', handleAsk);

export { router as askRoutes };
