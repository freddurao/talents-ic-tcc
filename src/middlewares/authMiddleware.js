import jwt from 'jsonwebtoken';
import { env } from '../utils/env-validator.js';
import userRepository from '../repositories/UserRepository.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.', error: true, notAuthorized: true });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no token.', error: true, notAuthorized: true });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token malformatado.', error: true, notAuthorized: true });
  }

  jwt.verify(token, env.SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido.', error: true, notAuthorized: true });
    }

    // O token continua válido por até 2h depois de emitido: confere se a conta
    // não foi desativada ou removida nesse meio-tempo.
    try {
      if (!(await userRepository.isUserActive(decoded.userId))) {
        return res.status(401).json({ message: 'Conta desativada.', error: true, notAuthorized: true });
      }
    } catch (error) {
      return next(error);
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    return next();
  });
};

export default authMiddleware;
