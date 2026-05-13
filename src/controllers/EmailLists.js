import EmailListService from '../services/EmailListService.js';

export const getAllEmailLists = async (req, res, next) => {
  try {
    const emailList = await EmailListService.getAllEmailLists();
    res.status(200).json(emailList);
  } catch (error) {
    next(error);
  }
};

export const getEmailListById = async (req, res, next) => {
  try {
    const emailList = await EmailListService.getEmailListById(req.params.id);
    res.status(200).json(emailList);
  } catch (error) {
    next(error);
  }
};

export const createBulkEmailLists = async (req, res, next) => {
  try {
    const result = await EmailListService.createBulkEmailLists(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAllIsActive = async (req, res, next) => {
  try {
    const result = await EmailListService.updateAllIsActive(req.body.state);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEmailList = async (req, res, next) => {
  try {
    const result = await EmailListService.updateEmailList(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteBulkEmailLists = async (req, res, next) => {
  try {
    const result = await EmailListService.deleteBulkEmailLists(req.params.ids);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEmailListState = async (req, res, next) => {
  try {
    const result = await EmailListService.getEmailListState();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
