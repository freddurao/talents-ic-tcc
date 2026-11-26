import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Limites por IP, guardados em memória (zeram quando a API reinicia).
// Respondem 429 com uma mensagem no mesmo formato dos outros erros da API.
const limiter = (limit, message, options = {}) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message, error: true },
    ...options
  });

// Login: 10 tentativas erradas a cada 15 minutos. Logins certos não contam,
// então quem só erra a senha uma ou duas vezes nunca é bloqueado.
export const loginLimiter = limiter(10, 'Muitas tentativas de login. Tente novamente em 15 minutos.', {
  skipSuccessfulRequests: true
});

// Recuperação de senha: 5 pedidos a cada 15 minutos. Evita disparar e-mails em massa
// e tentar adivinhar tokens de recuperação.
export const passwordRecoveryLimiter = limiter(5, 'Muitos pedidos de recuperação de senha. Tente novamente em 15 minutos.');
