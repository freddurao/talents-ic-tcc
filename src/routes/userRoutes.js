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

const router = express.Router();

//Routes for User
router.post('/login', authenticate);
router.post('/convite', authMiddleware, inviteUser);
router.post('/recuperacao/senha', passwordRecovery);
router.get('/', authMiddleware, getAllUsers);
router.post('/', createUser);
router.get('/:id/vagas/criadas', authMiddleware, getCreatedJobsByUser);
router.get('/:id/vagas/aplicadas', authMiddleware, getAppliedJobsByUser);
router.get('/:id', authMiddleware, getUserById);
router.patch('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
