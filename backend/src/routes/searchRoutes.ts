import { Router } from 'express';
import { handleSearch } from '../controllers/searchController.js';

const router = Router();

router.post('/search', handleSearch);

export { router as searchRoutes };
