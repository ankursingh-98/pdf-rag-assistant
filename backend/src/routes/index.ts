import { Router } from 'express';
import { askRoutes } from './askRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { searchRoutes } from './searchRoutes.js';
import { uploadRoutes } from './uploadRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use(uploadRoutes);
router.use(searchRoutes);
router.use(askRoutes);

export { router as apiRoutes };
