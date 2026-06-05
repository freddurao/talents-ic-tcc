import bcrypt from 'bcrypt';
import repository from '../repositories/UserRepository.js';
import userJobRepository from '../repositories/User_JobRepository.js';
import profileRepository from '../repositories/ProfileRepository.js';
import tokenRepository from '../repositories/TokenRepository.js';
import auth from '../utils/auth.js';
import AppError from '../utils/AppError.js';
import EmailService from './EmailService.js';
import crypto from 'crypto';
import { env } from '../utils/env-validator.js';
import { UserRole } from '@prisma/client';

const checkValidEmail = (email) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(email)) throw new AppError('E-mail em formato inválido.', 400);
};

const checkExistentEmail = async (email) => {
  const count = await repository.checkExistentEmail(email);
  if (count > 0) {
    throw new AppError('E-mail já cadastrado.', 400);
  }
};

const getAllUsers = async () => {
  return await repository.getAllUsers();
};

const getUserById = async (targetId, requestingUser) => {
  const { userId, role } = requestingUser;

  if (targetId !== userId && role !== 'ADMIN') {
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
  const { userId, role } = requestingUser;

  if (targetId !== userId && role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }

  return await userJobRepository.getJobsByUserId(targetId, true, itemsPerPage, pageNumber);
};

const getAppliedJobsByUser = async (targetId, requestingUser, { pageNumber, itemsPerPage }) => {
  const { userId, role } = requestingUser;

  if (targetId !== userId && role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }

  return await userJobRepository.getJobsByUserId(targetId, false, itemsPerPage, pageNumber);
};

const createUser = async (userData) => {
  checkValidEmail(userData.email);
  await checkExistentEmail(userData.email);

  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(userData.password, salt);

  // Set default role and auth status
  userData.role = 'COMMON';
  userData.isActive = true;

  // Secret check for creating ADMIN users
  if (userData.secret === env.SECRET_ADM) {
    userData.role = 'ADMIN';
  }

  const user = await repository.createUser(userData);
  const token = auth.createToken(user.id, user.role, user.name);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: token
  };
};

const authenticate = async ({ email, password }) => {
  const user = await repository.getUserByEmail(email);
  if (!user) {
    throw new AppError('Acesso negado.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Conta desativada.', 403);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new AppError('Acesso negado.', 401);
  }

  const token = auth.createToken(user.id, user.role, user.name);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: token
  };
};

const updateUser = async (targetId, userData, requestingUser) => {
  const { role, userId } = requestingUser;

  if (targetId !== userId && role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }

  const currentUser = await repository.getUserById(targetId);
  if (!currentUser) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  const updatePayload = {};

  // Email validation and change detection
  if (userData.email && userData.email !== currentUser.email) {
    checkValidEmail(userData.email);
    await checkExistentEmail(userData.email);
    updatePayload.email = userData.email;
  }

  // Name change detection
  if (userData.name && userData.name !== currentUser.name) {
    updatePayload.name = userData.name;
  }

  // Role change detection (Admin only can change roles)
  if (userData.role && userData.role !== currentUser.role) {
    if (role !== 'ADMIN') {
      throw new AppError('Acesso não autorizado para alterar cargo.', 401);
    }
    updatePayload.role = userData.role;
  }

  // Password hashing and change detection
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    updatePayload.password = hashedPassword;
  }

  // Active status detection
  if (userData.isActive !== undefined && userData.isActive !== currentUser.isActive) {
    updatePayload.isActive = userData.isActive;
  }

  // Only perform update if there are actual changes
  if (Object.keys(updatePayload).length > 0) {
    await repository.updateUser(updatePayload, targetId);
    return { message: 'usuário atualizado.' };
  }

  return { message: 'nenhuma alteração detectada.' };
};

const deleteUser = async (targetId, requestingUser) => {
  const { role, userId } = requestingUser;

  if (role === 'ADMIN' || targetId === userId) {
    await repository.deleteUser(targetId);
    return;
  }

  throw new AppError('Acesso não autorizado.', 401);
};

const inviteUser = (email, requestingUser) => {
  EmailService.sendInviteEmail(email, env.SIGNUP_URL);
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
      EmailService.sendRecoveryEmail(email, env.RECOVERY_URL + random_token);
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
