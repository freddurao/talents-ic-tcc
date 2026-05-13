import SkillService from '../services/SkillService.js';

export const getAllSkills = async (req, res, next) => {
  try {
    const skills = await SkillService.getAllSkills();
    res.status(200).json(skills);
  } catch (error) {
    next(error);
  }
};

export const getSkillById = async (req, res, next) => {
  try {
    const skillInfo = await SkillService.getSkillById(req.params.id);
    res.status(200).json(skillInfo);
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const result = await SkillService.updateSkill(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    await SkillService.deleteSkill(req.params.id);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

export const createBulkSkills = async (req, res, next) => {
  try {
    const result = await SkillService.createBulkSkills(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
