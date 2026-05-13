import bcrypt from 'bcrypt';
import repository from '../repositories/UserRepository.js';
import userJobRepository from '../repositories/User_JobRepository.js';
import profileRepository from '../repositories/ProfileRepository.js';
import tokenRepository from '../repositories/TokenRepository.js';
import auth from '../utils/auth.js';
import AppError from '../utils/AppError.js';
import { inviteMail, recoveryMail } from '../utils/emailSender.js';
import crypto from 'crypto';

const checkValidEmail = (email) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(email)) throw new AppError('E-mail inválido ou existente.', 400);
};

const checkExistentEmail = async (email) => {
  try {
    const count = await repository.checkExistentEmail(email);
    if (count) throw new Error();
  } catch (error) {
    throw new AppError('E-mail inválido ou existente.', 400);
  }
};

const getAllUsers = async () => {
  return await repository.getAllUsers();
};

const getUserById = async (targetId, requestingUser) => {
  const { userId, isAdmin } = requestingUser;
  if (targetId != userId && !isAdmin) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  const user = await repository.getUserById(targetId);
  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const profile = await profileRepository.getProfileByUserId(user.id);
  user.profileId = profile ? profile.id : -1;
  return user;
};

const getCreatedJobsByUser = async (targetId, requestingUser, { pageNumber, itemsPerPage }) => {
  const { userId, isAdmin } = requestingUser;
  if (targetId != userId && !isAdmin) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  return await userJobRepository.getJobsByUserId(targetId, true, itemsPerPage, pageNumber);
};

const getAppliedJobsByUser = async (targetId, requestingUser, { pageNumber, itemsPerPage }) => {
  const { userId, isAdmin } = requestingUser;
  if (targetId != userId && !isAdmin) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  return await userJobRepository.getJobsByUserId(targetId, false, itemsPerPage, pageNumber);
};

const createUser = async (userData) => {
  checkValidEmail(userData.email);
  await checkExistentEmail(userData.email);

  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(userData.password, salt);

  if (!(userData.isAdmin === true && userData.secret === process.env.SECRET_ADM)) {
    userData.isAdmin = false;
    userData.isAuthorized = false;
  } else {
    userData.isAuthorized = true;
  }

  const user = await repository.createUser(userData);
  const token = auth.createToken(user.id, user.isAdmin);

  return {
    id: user.id,
    token: token
  };
};

const authenticate = async ({ email, password }) => {
  const user = await repository.getUserByEmail(email);
  if (!user) {
    throw new AppError('Acesso negado.', 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError('Acesso negado.', 401);
  }

  const token = auth.createToken(user.id, user.isAdmin);
  return {
    id: user.id,
    token: token
  };
};

const updateUser = async (targetId, userData, requestingUser) => {
  const { isAdmin, userId } = requestingUser;

  if (userData.email) {
    checkValidEmail(userData.email);
    await checkExistentEmail(userData.email);
  }

  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }

  if (targetId == userId || isAdmin) {
    await repository.updateUser(userData, targetId);
    return { message: 'usuário atualizado.' };
  }
  
  throw new AppError('Acesso não autorizado.', 401);
};

const deleteUser = async (targetId, requestingUser) => {
  const { isAdmin, userId } = requestingUser;

  if (targetId == userId || isAdmin) {
    await repository.deleteUser(targetId);
    return;
  }
  
  throw new AppError('Acesso não autorizado.', 401);
};

const inviteUser = (email, requestingUser) => {
  inviteMail(email);
  return { message: 'Convite enviado.', userId: requestingUser.userId };
};

const passwordRecovery = async ({ email, token, password }) => {
  if (email) {
    await tokenRepository.deleteExpiredTokens();
    const user = await repository.getUserByEmail(email);
    if (user) {
      let random_token = crypto.randomBytes(20).toString('hex');
      try {
        await tokenRepository.createToken(user.id, random_token);
      } catch {
        random_token = crypto.randomBytes(20).toString('hex');
        await tokenRepository.createToken(user.id, random_token);
      }
      recoveryMail(email, random_token);
    }
    return 'OK';
  } else if (token && password) {
    const received_token = await tokenRepository.checkToken(token);
    if (received_token) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await repository.updateUser({ password: hashedPassword }, received_token.userId);
      await tokenRepository.deleteToken(received_token.token);
      return { message: 'Senha atualizada.' };
    } 
    throw new AppError('invalid token', 400);
  }
  
  throw new AppError('Dados incompletos.', 400);
};

export default {
  getAllUsers,
  getUserById,
  getCreatedJobsByUser,
  getAppliedJobsByUser,
  createUser,
  authenticate,
  updateUser,
  deleteUser,
  inviteUser,
  passwordRecovery,
  checkValidEmail,
  checkExistentEmail
};
