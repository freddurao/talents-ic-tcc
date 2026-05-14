import jwt from 'jsonwebtoken';
import { env } from './env-validator.js';

//Create token for user request validation
const createToken = (id, isAdmin) => {
  try {
    const token = jwt.sign({ userId: id, isAdmin: isAdmin }, env.SECRET, {
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
    return { userId: decoded.userId, isAdmin: decoded.isAdmin };
  } catch (error) {
    error.message = 'Acesso não autorizado.';
    error.auth = true;
    throw error;
  }
};

export default { createToken, getTokenProperties };
