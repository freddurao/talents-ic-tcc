const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    // 403: o usuário está logado, mas não tem permissão (401 faria o front deslogá-lo)
    res.status(403).json({ message: 'Acesso não autorizado.', error: true });
  }
};

export default adminMiddleware;
