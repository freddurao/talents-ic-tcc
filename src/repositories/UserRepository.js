import prisma from '../common/prisma/prisma.js';

const getAllUsers = async () => {
  const [users, count] = await prisma.$transaction([
    prisma.user.findMany({
      omit: {
        password: true,
      }
    }),
    prisma.user.count()
  ]);
  return { rows: users, count };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      isAuthorized: true
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
  const count = await prisma.user.count({
    where: { email }
  });

  if (count > 0) {
    throw new Error('E-mail já cadastrado.');
  }
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
    where: { id: Number(id) },
    data: userData
  });
};

const deleteUser = async (id) => {
  const userId = Number(id);
  
  // Busca os IDs das vagas criadas por este usuário
  const userCreatedJobs = await prisma.userJob.findMany({
    where: {
      userId: userId,
      created: true
    },
    select: { jobId: true }
  });

  const jobIds = userCreatedJobs.map((uj) => uj.jobId);

  // Deleta as vagas e o usuário. O Prisma/DB cuidará do Cascade para Profile, Token e UserJobScore.
  await prisma.$transaction([
    prisma.job.deleteMany({
      where: { id: { in: jobIds } }
    }),
    prisma.user.delete({
      where: { id: userId }
    })
  ]);

  return 1;
};

export default { getAllUsers, getUserByEmail, getUserById, checkExistentEmail, deleteUser, updateUser, createUser };
