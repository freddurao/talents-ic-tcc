import express from 'express';
import {
  getAllProfiles,
  getProfileById,
  updateProfile,
  createProfile,
  deleteProfile,
  getOwnPerfil
} from '../controllers/Profiles.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

//Routes for Profiles
router.get('/', getAllProfiles);
router.get('/:id', authMiddleware, getProfileById);
router.get('/meuperfil/:id', authMiddleware, getOwnPerfil)
router.patch('/:id', authMiddleware, updateProfile);
router.post('/', authMiddleware, createProfile);
router.delete('/:id', authMiddleware, deleteProfile);
export default router;
