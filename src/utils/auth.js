import jwt from 'jsonwebtoken';
import { env } from './env-validator.js';

const createToken = (id, role, name) => {
  try {
    const token = jwt.sign({ userId: id, role: role, name: name }, env.SECRET, {
      expiresIn: 7200 // expires in 2h
    });
    return token;
  } catch (error) {
    error.message = 'Ocorreu um erro.';
    throw error;
  }
};

const getTokenProperties = (token) => {
  try {
    const decoded = jwt.verify(token, env.SECRET);
    return { 
      userId: decoded.userId, 
      role: decoded.role
    };
  } catch (error) {
    error.message = 'Acesso não autorizado.';
    error.auth = true;
    throw error;
  }
};

export default { createToken, getTokenProperties };
