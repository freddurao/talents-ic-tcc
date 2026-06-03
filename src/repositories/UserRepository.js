import prisma from '../common/prisma/prisma.js';

const getAllUsers = async () => {
  const [users, count] = await prisma.$transaction([
    prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.user.count()
  ]);
  return { rows: users, count };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      company: true
    }
  });
  return user;
};

const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email }
  });
  return user;
};

const checkExistentEmail = async (email) => {
  return await prisma.user.count({
    where: { email }
  });
};

const createUser = async (body) => {
  const { secret, confirmPassword, ...userData } = body;
  const user = await prisma.user.create({
    data: userData
  });
  return user;
};

const updateUser = async (body, id) => {
  const { secret, confirmPassword, ...userData } = body;
  return await prisma.user.update({
    where: { id: id },
    data: userData
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id }
  });
};

export default { getAllUsers, getUserByEmail, getUserById, checkExistentEmail, deleteUser, updateUser, createUser };
