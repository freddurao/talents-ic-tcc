import express from 'express';
import {
  createRequest,
  requestAssociation,
  getPendingRequests,
  getPendingAssociationRequests,
  approveRequest,
  rejectRequest,
  approveAssociationRequest,
  rejectAssociationRequest,
  getCompanies,
  leaveCompany
} from '../controllers/Companies.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/solicitacao', authMiddleware, createRequest);
router.post('/associar', authMiddleware, requestAssociation);
router.post('/sair', authMiddleware, leaveCompany);
router.get('/pendentes', authMiddleware, adminMiddleware, getPendingRequests);
router.get('/associacoes/pendentes', authMiddleware, getPendingAssociationRequests);
router.patch('/aprovar/:id', authMiddleware, adminMiddleware, approveRequest);
router.patch('/rejeitar/:id', authMiddleware, adminMiddleware, rejectRequest);
router.patch('/associacoes/aprovar/:id', authMiddleware, approveAssociationRequest);
router.patch('/associacoes/rejeitar/:id', authMiddleware, rejectAssociationRequest);
router.get('/', getCompanies);

export default router;
