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

const router = express.Router();

//Routes for User
router.post('/login', authenticate);
router.post('/convite', inviteUser);
router.post('/recuperacao/senha', passwordRecovery);
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id/vagas/criadas', getCreatedJobsByUser);
router.get('/:id/vagas/aplicadas', getAppliedJobsByUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
