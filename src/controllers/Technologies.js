import repository from '../repositories/TechnologyRepository.js';

export const getAllTechnologies = async (req, res) => {
  try {
    const technologies = await repository.getAllTechnologies();
    res.status(200).json(technologies);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getTechnologyById = async (req, res) => {
  try {
    const technology = await repository.getTechnologyById(req.params.id);

    if (!technology) {
      return res.status(404).json({
        message: 'Tecnologia não encontrada.',
        error: true
      });
    }

    return res.status(200).json(technology);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const updateTechnology = async (req, res) => {
  try {
    const result = await repository.updateTechnology(req.body, req.params.id);
    if (result)
      res.status(200).json({
        message: 'Tecnologia atualizada.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const deleteTechnology = async (req, res) => {
  try {
    const result = await repository.deleteTechnology(req.params.id);
    if (result)
      res.status(204).json({
        message: 'Tecnologia deletada.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

//Create multiple technologies on db at the same request
export const createBulkTechnologies = async (req, res) => {
  try {
    const result = await repository.createBulkTechnologies(req.body);
    if (result.count > 0)
      res.status(201).json({
        message: 'Tecnologias criadas.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};
