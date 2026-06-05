import skillRepository from '../repositories/SkillRepository.js';
import AppError from '../utils/AppError.js';

const getAllSkills = async () => {
  return await skillRepository.getAllSkills();
};

const getSkillById = async (skillId) => {
  const skill = await skillRepository.getSkillById(skillId);
  if (!skill) {
    throw new AppError('Habilidade não encontrada.', 404);
  }
  return skill;
};

const updateSkill = async (skillId, skillData) => {
  const result = await skillRepository.updateSkill(skillData, skillId);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Habilidade atualizada.' };
};

const deleteSkill = async (skillId) => {
  const result = await skillRepository.deleteSkill(skillId);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
};

const createBulkSkills = async (skillsData) => {
  const result = await skillRepository.createBulkSkills(skillsData);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Habilidades criadas.' };
};

export default {
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  createBulkSkills
};
