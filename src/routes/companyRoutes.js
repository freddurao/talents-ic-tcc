import express from 'express';
import {
  createRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getCompanies
} from '../controllers/Companies.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/solicitacao', authMiddleware, createRequest);
router.get('/pendentes', authMiddleware, adminMiddleware, getPendingRequests);
router.patch('/aprovar/:id', authMiddleware, adminMiddleware, approveRequest);
router.patch('/rejeitar/:id', authMiddleware, adminMiddleware, rejectRequest);
router.get('/', authMiddleware, getCompanies);

export default router;
