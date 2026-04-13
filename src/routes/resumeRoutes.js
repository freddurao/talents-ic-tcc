import express from 'express';
import { extractResumeData, upload } from '../controllers/ResumeParser.js';

const router = express.Router();

/**
 * POST /curriculo/extrair
 * Multipart form-data with field "curriculo" containing the file.
 * Returns extracted profile data as JSON.
 */
router.post('/extrair', upload.single('curriculo'), extractResumeData);

export default router;
