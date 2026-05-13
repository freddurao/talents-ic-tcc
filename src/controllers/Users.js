import UserService from '../services/UserService.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id, req.user);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

//Get all jobs that user created
export const getCreatedJobsByUser = async (req, res, next) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const user_jobs = await UserService.getCreatedJobsByUser(req.params.id, req.user, { pageNumber, itemsPerPage });
    res.status(200).json(user_jobs);
  } catch (error) {
    next(error);
  }
};

//Get all jobs that user applied to
export const getAppliedJobsByUser = async (req, res, next) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const user_jobs = await UserService.getAppliedJobsByUser(req.params.id, req.user, { pageNumber, itemsPerPage });
    res.status(200).json(user_jobs);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const authenticate = async (req, res, next) => {
  try {
    const result = await UserService.authenticate(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const result = await UserService.updateUser(req.params.id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await UserService.deleteUser(req.params.id, req.user);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

export const inviteUser = async (req, res, next) => {
  try {
    const result = UserService.inviteUser(req.body.email, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

//Delete expired tokens, create new password recovery tokens and recovers password
export const passwordRecovery = async (req, res, next) => {
  try {
    const result = await UserService.passwordRecovery(req.body);
    if (result === 'OK') {
        res.sendStatus(200);
    } else {
        res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
};
