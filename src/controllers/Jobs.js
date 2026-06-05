import { buildJobWhereClause } from '../utils/filters.js';
import JobService from '../services/JobService.js';

//Get all jobs from db (can return filtered data by HTTP GET params)
export const getAllJobs = async (req, res, next) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const filters = buildJobWhereClause(req);
    const result = await JobService.getAllJobs(filters, itemsPerPage, pageNumber);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

//Get a job by given id
export const getJobById = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const result = await JobService.getJobById(req.params.id, authHeader);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

//Create new job
export const createJob = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await JobService.createJob(req.body, userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

//Update job record on db
export const updateJob = async (req, res, next) => {
  try {
    const result = await JobService.updateJob(req.params.id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackStatus = async(req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await JobService.getFeedbackStatus(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatusJob = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await JobService.updateStatusJob(req.params.id, userId, req.body);
    res.status(204).json(result);
  } catch (error) {
    next(error);
  }
};

//Delete job from db
export const deleteJob = async (req, res, next) => {
  try {
    await JobService.deleteJob(req.params.id, req.user);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

//Apply user to a job and send an email for the job creator
export const applyToJob = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await JobService.applyToJob(userId, req.body.jobId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
