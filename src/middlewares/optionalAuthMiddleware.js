import auth from '../utils/auth.js';

// Para rotas públicas que mudam de comportamento quando há alguém logado.
// Com um token válido, preenche req.user (mesmo formato do authMiddleware).
// Sem token, ou com token inválido/expirado, segue como visitante: nunca responde 401.
const optionalAuthMiddleware = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (/^Bearer$/i.test(scheme) && token) {
    try {
      req.user = auth.getTokenProperties(token);
    } catch {
      // Token inválido: trata como visitante
    }
  }

  return next();
};

export default optionalAuthMiddleware;
