import prisma from '../common/prisma/prisma.js';

const createToken = async (userId, token) => {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 15);

  const token_object = await prisma.token.create({
    data: {
      userId: userId,
      token: token,
      expiration: expiration
    }
  });
  return token_object;
};

const checkToken = async (token) => {
  const token_object = await prisma.token.findFirst({
    where: {
      token: token,
      expiration: { gt: new Date() }
    }
  });
  return token_object;
};

const deleteExpiredTokens = async () => {
  const result = await prisma.token.deleteMany({
    where: {
      expiration: { lt: new Date() }
    }
  });
  return result.count;
};

const deleteToken = async (token) => {
  const result = await prisma.token.deleteMany({
    where: {
      token: token
    }
  });
  return result.count;
};

export default { createToken, deleteExpiredTokens, checkToken, deleteToken };
