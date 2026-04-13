import prisma from '../common/prisma/prisma.js';

const getAllJobs = async (filters, itemsPerPage, pageNumber) => {
  const take = itemsPerPage || undefined;
  const skip = (pageNumber - 1) * itemsPerPage || 0;

  const [jobs, count] = await prisma.$transaction([
    prisma.job.findMany({
      where: filters,
      take,
      skip
    }),
    prisma.job.count({ where: filters })
  ]);

  return { rows: jobs, count };
};

const getOnlyJobsToRecommend = async (lista) => {
  const jobs = await prisma.job.findMany({
    where: {
      id: {
        notIn: lista
      }
    }
  });
  return jobs;
};

const getJobById = async (id) => {
  const job = await prisma.job.findUnique({
    where: {
      id: Number(id)
    }
  });
  return job;
};

const createJob = async (body, userId) => {
  const { default: User_JobRepository } = await import('./User_JobRepository.js');
  
  const { emailsToSend, userId: bodyUserId, ...jobData } = body;
  
  const job = await prisma.job.create({
    data: {
      ...jobData,
      workload: parseFloat(jobData.workload),
      salary: parseFloat(jobData.salary),
      startingDate: new Date(jobData.startingDate),
      endingDate: new Date(jobData.endingDate),
      createdAt: new Date(),
    }
  });
  
  await User_JobRepository.createUser_Job(userId, job.id, true);
  return job;
};

const updateJob = async (body, id) => {
  try {
    const { emailsToSend, userId: bodyUserId, ...jobData } = body;
    const dataToUpdate = { ...jobData };

    if (dataToUpdate.workload) dataToUpdate.workload = parseFloat(dataToUpdate.workload);
    if (dataToUpdate.salary) dataToUpdate.salary = parseFloat(dataToUpdate.salary);
    if (dataToUpdate.startingDate) dataToUpdate.startingDate = new Date(dataToUpdate.startingDate);
    if (dataToUpdate.endingDate) dataToUpdate.endingDate = new Date(dataToUpdate.endingDate);

    return await prisma.job.update({
      where: {
        id: Number(id)
      },
      data: dataToUpdate
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const deleteJob = async (id) => {
  try {
    await prisma.job.delete({
      where: {
        id: Number(id)
      }
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const applyToJob = async (userId, jobId) => {
  const { default: User_JobRepository } = await import('./User_JobRepository.js');
  return await User_JobRepository.createUser_Job(userId, jobId, false);
};

const deleteExpiredJobs = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await prisma.job.deleteMany({
    where: {
      createdAt: {
        lt: sixMonthsAgo
      }
    }
  });
  return result.count;
};

const countValidJob = async (jobId) => {
  const count = await prisma.job.count({
    where: {
      endingDate: {
        gte: new Date()
      },
      id: Number(jobId)
    }
  });
  return count;
};

export default {
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  createJob,
  applyToJob,
  deleteExpiredJobs,
  countValidJob,
  getOnlyJobsToRecommend
};
