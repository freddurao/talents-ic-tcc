import prisma from '../common/prisma/prisma.js';

const createUser_Job = async (userId, jobId, created) => {
  const user_job = await prisma.userJob.create({
    data: {
      userId: Number(userId),
      jobId: Number(jobId),
      created: created
    }
  });
  return user_job;
};

const getJobsByUserId = async (userId, created, itemsPerPage, pageNumber) => {
  const take = itemsPerPage || undefined;
  const skip = (pageNumber - 1) * itemsPerPage || 0;
  const filter = {
    userId: Number(userId),
    created: created
  };

  const [userJobs, count] = await prisma.$transaction([
    prisma.userJob.findMany({
      where: filter,
      include: {
        job: true
      },
      take,
      skip
    }),
    prisma.userJob.count({ where: filter })
  ]);

  // Formata o retorno para manter a estrutura do Sequelize (com nested objects)
  return { rows: userJobs, count };
};

const getInformationByJobId = async (jobId) => {
  const createdJobsByUser = await prisma.userJob.findFirst({
    where: {
      jobId: Number(jobId),
      created: true
    },
    include: {
      job: true,
      user: {
        select: {
          name: true,
          email: true,
          isAdmin: true,
          isAuthorized: true
        }
      }
    }
  });
  return createdJobsByUser;
};

//Check if user created a job
const countUser_JobByJobIdAndUserId = async (jobId, userId) => {
  const count = await prisma.userJob.count({
    where: { 
      jobId: Number(jobId), 
      userId: Number(userId), 
      created: true 
    }
  });
  return count;
};

export default { createUser_Job, getJobsByUserId, getInformationByJobId, countUser_JobByJobIdAndUserId };
