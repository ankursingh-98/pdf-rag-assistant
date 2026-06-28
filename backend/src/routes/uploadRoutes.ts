import { Router } from 'express';
import { handleUpload } from '../controllers/uploadController.js';
import { uploadPdfFiles } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.post('/upload', uploadPdfFiles, handleUpload);

export { router as uploadRoutes };
