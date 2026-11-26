import auth from '../utils/auth.js';
import userRepository from '../repositories/UserRepository.js';

// Para rotas públicas que mudam de comportamento quando há alguém logado.
// Com um token válido, preenche req.user (mesmo formato do authMiddleware).
// Sem token, com token inválido/expirado ou com a conta desativada, segue como
// visitante: nunca responde 401.
const optionalAuthMiddleware = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (/^Bearer$/i.test(scheme) && token) {
    let user;
    try {
      user = auth.getTokenProperties(token);
    } catch {
      // Token inválido: trata como visitante
    }

    try {
      if (user && (await userRepository.isUserActive(user.userId))) req.user = user;
    } catch (error) {
      return next(error);
    }
  }

  return next();
};

export default optionalAuthMiddleware;
