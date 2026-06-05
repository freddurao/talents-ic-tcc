import express from 'express';

import {
  getAllEmailLists,
  getEmailListById,
  updateEmailList,
  deleteBulkEmailLists,
  updateAllIsActive,
  createBulkEmailLists,
  getEmailListState
} from '../controllers/EmailLists.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

//Routes for Skill
router.get('/verificacao', getEmailListState);
router.get('/', authMiddleware, adminMiddleware, getAllEmailLists);
router.get('/:id', authMiddleware, adminMiddleware, getEmailListById);
router.post('/', authMiddleware, adminMiddleware, createBulkEmailLists);
router.patch('/:id', authMiddleware, adminMiddleware, updateEmailList);
router.patch('/', authMiddleware, adminMiddleware, updateAllIsActive);
router.delete('/:ids', authMiddleware, adminMiddleware, deleteBulkEmailLists);

export default router;
