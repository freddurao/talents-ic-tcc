import TechnologyService from '../services/TechnologyService.js';

export const getAllTechnologies = async (req, res, next) => {
  try {
    const technologies = await TechnologyService.getAllTechnologies();
    res.status(200).json(technologies);
  } catch (error) {
    next(error);
  }
};

export const getTechnologyById = async (req, res, next) => {
  try {
    const technology = await TechnologyService.getTechnologyById(req.params.id);
    res.status(200).json(technology);
  } catch (error) {
    next(error);
  }
};

export const updateTechnology = async (req, res, next) => {
  try {
    const result = await TechnologyService.updateTechnology(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteTechnology = async (req, res, next) => {
  try {
    await TechnologyService.deleteTechnology(req.params.id);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

//Create multiple technologies on db at the same request
export const createBulkTechnologies = async (req, res, next) => {
  try {
    const result = await TechnologyService.createBulkTechnologies(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
