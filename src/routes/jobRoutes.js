import express from 'express';

import { getAllJobs, createJob, getJobById, updateJob, deleteJob, applyToJob, updateStatusJob, getFeedbackStatus } from '../controllers/Jobs.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

//Routes for Job
router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', authMiddleware, createJob);
router.post('/aplicacao', authMiddleware, applyToJob);
router.patch('/:id', authMiddleware, updateJob);
router.delete('/:id', authMiddleware, deleteJob);
router.put('/:id', authMiddleware, updateStatusJob)
router.get('/feedback/:id', authMiddleware, getFeedbackStatus)

export default router;
