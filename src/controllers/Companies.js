import CompanyService from '../services/CompanyService.js';

export const createRequest = async (req, res, next) => {
  try {
    const result = await CompanyService.requestCompanyCreation(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await CompanyService.listPendingRequests(req.user);
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (req, res, next) => {
  try {
    const result = await CompanyService.approveRequest(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const result = await CompanyService.rejectRequest(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await CompanyService.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};
