const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
  }
};

export default adminMiddleware;

