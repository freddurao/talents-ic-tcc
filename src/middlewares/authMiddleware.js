import jwt from 'jsonwebtoken';
import { env } from '../utils/env-validator.js';

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

  jwt.verify(token, env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido.', error: true, notAuthorized: true });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    return next();
  });
};

export default authMiddleware;
