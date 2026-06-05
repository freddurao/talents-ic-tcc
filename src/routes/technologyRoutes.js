import express from 'express';
import {
  getAllTechnologies,
  getTechnologyById,
  updateTechnology,
  deleteTechnology,
  createBulkTechnologies
} from '../controllers/Technologies.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

//Routes for Technologies
router.get('/', getAllTechnologies);
router.get('/:id', getTechnologyById);
router.post('/', authMiddleware, adminMiddleware, createBulkTechnologies);
router.patch('/:id', authMiddleware, adminMiddleware, updateTechnology);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTechnology);

export default router;
