import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import repository from '../repositories/UserRepository.js';
import User_JobRepository from '../repositories/User_JobRepository.js';
import auth from '../utils/auth.js';
import ProfileRepository from '../repositories/ProfileRepository.js';
import { inviteMail, recoveryMail } from '../utils/emailSender.js';
import TokenRepository from '../repositories/TokenRepository.js';
import crypto from 'crypto';

dotenv.config();

//Check if e-mail is valid
const checkValidEmail = (email) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regex.test(email)) throw new Error('E-mail inválido ou existente.');
};

//Check if e-mail exists in db
const checkExistentEmail = async (email) => {
  try {
    const count = await repository.checkExistentEmail(email);
    if (count) throw new Error();
  } catch (error) {
    error.message = 'E-mail inválido ou existente.';
    throw error;
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await repository.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    if (req.params.id != userId && !isAdmin) {
      return res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
    }

    const user = await repository.getUserById(req.params.id);
    if (user) {
      const profile = await ProfileRepository.getProfileByUserId(user.id);
      user.profileId = profile ? profile.id : -1;
      res.status(200).json(user);
    } else res.status(404).json({ message: 'Usuário não encontrado.', error: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

//Get all jobs that user created
export const getCreatedJobsByUser = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    if (req.params.id != userId && !isAdmin) {
      return res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
    }

    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const user_jobs = await User_JobRepository.getJobsByUserId(req.params.id, true, itemsPerPage, pageNumber);
    res.status(200).json(user_jobs);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

//Get all jobs that user applied to
export const getAppliedJobsByUser = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    if (req.params.id != userId && !isAdmin) {
      return res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
    }

    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const user_jobs = await User_JobRepository.getJobsByUserId(req.params.id, false, itemsPerPage, pageNumber);
    res.status(200).json(user_jobs);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const createUser = async (req, res) => {
  try {
    checkValidEmail(req.body.email);
    await checkExistentEmail(req.body.email);
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    if (!(req.body.isAdmin == true && req.body.secret == process.env.SECRET_ADM)) {
      req.body.isAdmin = false;
      req.body.isAuthorized = false;
    } else req.body.isAuthorized = true;
    const user = await repository.createUser(req.body);
    const token = auth.createToken(user.id, user.isAdmin);
    res.status(201).json({
      id: user.id,
      token: token
    });
  } catch (error) {
    res.status(400).json({ message: error.message, error: true });
  }
};

export const authenticate = async (req, res) => {
  try {
    const user = await repository.getUserByEmail(req.body.email);
    if (user) {
      //Compare password from req body to stored password by bcrypt compare
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (validPassword) {
        const token = auth.createToken(user.id, user.isAdmin);
        res.status(200).json({
          id: user.id,
          token: token
        });
      } else {
        res.status(401).json({ message: 'Acesso negado.', error: true });
      }
    } else {
      res.status(401).json({ message: 'Acesso negado.', error: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { isAdmin, userId } = req.user;

    if (req.body.email) {
      checkValidEmail(req.body.email);
      await checkExistentEmail(req.body.email);
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.params.id == userId || isAdmin) {
      await repository.updateUser(req.body, req.params.id);
      return res.status(200).json({
        message: 'usuário atualizado.'
      });
    } else res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { isAdmin, userId } = req.user;

    if (req.params.id == userId || isAdmin) {
      await repository.deleteUser(req.params.id);
      return res.status(204).json();
    } else res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { userId } = req.user;
    inviteMail(req.body.email);
    res.status(200).json({ message: 'Convite enviado.', userId: userId });
  } catch (error) {
    res.status(400).json({ message: error.message, error: true });
  }
};

//Delete expired tokens, create new password recovery tokens and recovers password
export const passwordRecovery = async (req, res) => {
  try {
    const email = req.body.email;
    const token = req.body.token;
    let password = req.body.password;
    if (email) {
      await TokenRepository.deleteExpiredTokens();
      const user = await repository.getUserByEmail(email);
      if (user) {
        let random_token = crypto.randomBytes(20).toString('hex');
        try {
          await TokenRepository.createToken(user.id, random_token);
        } catch {
          random_token = crypto.randomBytes(20).toString('hex');
          await TokenRepository.createToken(user.id, random_token);
        }
        recoveryMail(email, random_token);
      }
      res.sendStatus(200);
    } else if (token && password) {
      const received_token = await TokenRepository.checkToken(token);
      if (received_token) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        await repository.updateUser({ password: password }, received_token.userId);
        await TokenRepository.deleteToken(received_token.token);

        res.status(200).json({ message: 'Senha atualizada.' });
      } else throw new Error('invalid token');
    } else res.status(400).json({ message: 'Dados incompletos.', error: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};
