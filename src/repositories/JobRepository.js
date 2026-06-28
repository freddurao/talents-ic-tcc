import prisma from '../common/prisma/prisma.js';

const getAllJobs = async (filters, itemsPerPage, pageNumber) => {
  const take = itemsPerPage || undefined;
  const skip = (pageNumber - 1) * itemsPerPage || 0;

  const [jobs, count] = await prisma.$transaction([
    prisma.job.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        company: true
      },
      take,
      skip
    }),
    prisma.job.count({ where: filters })
  ]);

    const formattedJobs = jobs.map(job => {
    const newJob = { ...job };
    if (newJob.startingDate instanceof Date) newJob.startingDate = newJob.startingDate.toISOString().split("T")[0];
    if (newJob.endingDate instanceof Date) newJob.endingDate = newJob.endingDate.toISOString().split("T")[0];
    if (newJob.createdAt instanceof Date) newJob.createdAt = newJob.createdAt.toISOString().split("T")[0];
    return newJob;
  });

  return { rows: formattedJobs, count };
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
      id
    },
    include: {
      company: true
    }
  });
  if (job) {
    if (job.startingDate instanceof Date) job.startingDate = job.startingDate.toISOString().split('T')[0];
    if (job.endingDate instanceof Date) job.endingDate = job.endingDate.toISOString().split('T')[0];
    if (job.createdAt instanceof Date) job.createdAt = job.createdAt.toISOString().split('T')[0];
  }
  return job;
};

const createJob = async (body, userId) => {
  const { default: User_JobRepository } = await import('./User_JobRepository.js');
  
  const { emailsToSend, userId: bodyUserId, ...jobData } = body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true }
  });
  
  const job = await prisma.job.create({
    data: {
      ...jobData,
      companyId: user?.companyId || null,
      workload: parseFloat(jobData.workload),
      salary: parseFloat(jobData.salary),
      startingDate: jobData.startingDate ? new Date(jobData.startingDate + 'T12:00:00') : new Date(),
      endingDate: jobData.endingDate ? new Date(jobData.endingDate + 'T12:00:00') : new Date(),
      createdAt: new Date()
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
    if (dataToUpdate.startingDate) dataToUpdate.startingDate = new Date(dataToUpdate.startingDate + 'T12:00:00');
    if (dataToUpdate.endingDate) dataToUpdate.endingDate = new Date(dataToUpdate.endingDate + 'T12:00:00');

    return await prisma.job.update({
      where: {
        id
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
        id
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
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });
  
  if (!job) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  
  if (!job.endingDate || job.endingDate >= today) {
    return 1;
  }
  
  return 0;
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
