import technologyRepository from '../repositories/TechnologyRepository.js';
import AppError from '../utils/AppError.js';

const getAllTechnologies = async () => {
  return await technologyRepository.getAllTechnologies();
};

const getTechnologyById = async (techId) => {
  const technology = await technologyRepository.getTechnologyById(techId);
  if (!technology) {
    throw new AppError('Tecnologia não encontrada.', 404);
  }
  return technology;
};

const updateTechnology = async (techId, techData) => {
  const result = await technologyRepository.updateTechnology(techData, techId);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Tecnologia atualizada.' };
};

const deleteTechnology = async (techId) => {
  const result = await technologyRepository.deleteTechnology(techId);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
};

const createBulkTechnologies = async (techsData) => {
  const result = await technologyRepository.createBulkTechnologies(techsData);
  if (result.count === 0) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Tecnologias criadas.' };
};

export default {
  getAllTechnologies,
  getTechnologyById,
  updateTechnology,
  deleteTechnology,
  createBulkTechnologies
};
