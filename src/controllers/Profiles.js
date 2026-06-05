import ProfileService from '../services/ProfileService.js';
import { buildProfileWhereClause, buildUserNameWhereClause } from '../utils/filters.js';

//Get all searchable profiles
export const getAllProfiles = async (req, res, next) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const filters = buildProfileWhereClause(req);
    const name = buildUserNameWhereClause(req);
    const profiles = await ProfileService.getAllProfiles(filters, itemsPerPage, pageNumber, name);
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req, res, next) => {
  try {
    const profile = await ProfileService.getProfileById(req.params.id, req.user);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const getOwnPerfil = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const bestJobs = await ProfileService.getOwnPerfil(userId);
    res.status(200).json(bestJobs);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await ProfileService.updateProfile(req.params.id, req.body, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await ProfileService.createProfile(req.body, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await ProfileService.deleteProfile(req.params.id, userId);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
