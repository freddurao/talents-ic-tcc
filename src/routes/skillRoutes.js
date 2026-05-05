import express from 'express';

import { getAllSkills, getSkillById, updateSkill, deleteSkill, createBulkSkills } from '../controllers/Skills.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

//Routes for Skill
router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.post('/', authMiddleware, adminMiddleware, createBulkSkills);
router.patch('/:id', authMiddleware, adminMiddleware, updateSkill);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSkill);

export default router;
