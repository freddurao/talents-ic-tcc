import repository from '../repositories/SkillRepository.js';

export const getAllSkills = async (req, res) => {
  try {
    const skills = await repository.getAllSkills();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getSkillById = async (req, res) => {
  try {
    const skillInfo = await repository.getSkillById(req.params.id);
    if (skillInfo) res.status(200).json(skillInfo);
    else res.status(404).json({ message: 'Habilidade não encontrada.' });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const skillId = req.params.id;
    const result = await repository.updateSkill(req.body, skillId);
    if (result) {
      res.status(200).json({
        message: 'Habilidade atualizada.'
      });
    } else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const result = await repository.deleteSkill(req.params.id);
    if (result)
      res.status(204).json({
        message: 'Habilidade deletada.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const createBulkSkills = async (req, res) => {
  try {
    const result = await repository.createBulkSkills(req.body);
    if (result)
      res.status(201).json({
        message: 'Habilidades criadas.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};
