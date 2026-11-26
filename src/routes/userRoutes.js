import express from 'express';

import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  authenticate,
  getCreatedJobsByUser,
  getAppliedJobsByUser,
  inviteUser,
  passwordRecovery
} from '../controllers/Users.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { loginLimiter, passwordRecoveryLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

//Routes for User
router.post('/login', loginLimiter, authenticate);
router.post('/convite', authMiddleware, adminMiddleware, inviteUser);
router.post('/recuperacao/senha', passwordRecoveryLimiter, passwordRecovery);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.post('/', createUser);
router.get('/:id/vagas/criadas', authMiddleware, getCreatedJobsByUser);
router.get('/:id/vagas/aplicadas', authMiddleware, getAppliedJobsByUser);
router.get('/:id', authMiddleware, getUserById);
router.patch('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
