import prisma from '../common/prisma/prisma.js';

const createUser_JobScore = async (userId, jobId, status) => {
  const user_job_score = await prisma.userJobScore.create({
    data: {
      userId: Number(userId),
      jobId: Number(jobId),
      status: status
    }
  });
  return user_job_score;
};

const getInformationByJobIdAndUserId = async (jobId, userId) => {
  const user_job_score = await prisma.userJobScore.findFirst({
    where: {
      jobId: Number(jobId),
      userId: Number(userId)
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
  return user_job_score;
};

const getUser_JobScoreStatus = async (userId, jobId) => {
  const user_job_score = await prisma.userJobScore.findFirst({
    where: {
      userId: Number(userId),
      jobId: Number(jobId)
    },
    select: {
      id: true,
      status: true
    }
  });
  return user_job_score;
};

const updateUser_JobScoreStatus = async (body, userId, jobId) => {
  try {
    const user_job_score = await prisma.userJobScore.updateMany({
      where: {
        userId: Number(userId),
        jobId: Number(jobId)
      },
      data: {
        status: body.status
      }
    });
    return user_job_score;
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const deleteUser_JobScore = async (id) => {
  try {
    await prisma.userJobScore.delete({
      where: {
        id: Number(id)
      }
    });
    return 1;
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

export default { 
  createUser_JobScore, 
  getInformationByJobIdAndUserId, 
  getUser_JobScoreStatus, 
  updateUser_JobScoreStatus, 
  deleteUser_JobScore 
};
