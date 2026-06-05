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

    const formattedUserJobs = userJobs.map(uj => {
    const newUj = { ...uj };
    if (newUj.job) {
      const job = { ...newUj.job };
      if (job.startingDate instanceof Date) job.startingDate = job.startingDate.toISOString().split('T')[0];
      else if (job.startingDate) {
          const d = new Date(job.startingDate);
          if (!isNaN(d.getTime())) job.startingDate = d.toISOString().split('T')[0];
      }
      if (job.endingDate instanceof Date) job.endingDate = job.endingDate.toISOString().split('T')[0];
      else if (job.endingDate) {
          const d = new Date(job.endingDate);
          if (!isNaN(d.getTime())) job.endingDate = d.toISOString().split('T')[0];
      }
      if (job.createdAt instanceof Date) job.createdAt = job.createdAt.toISOString().split('T')[0];
      else if (job.createdAt) {
          const d = new Date(job.createdAt);
          if (!isNaN(d.getTime())) job.createdAt = d.toISOString().split('T')[0];
      }
      newUj.job = job;
    }
    return newUj;
  });

  return { rows: formattedUserJobs, count };
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
  
  if (createdJobsByUser && createdJobsByUser.job) {
    const job = createdJobsByUser.job;
    if (job.startingDate) {
        const d = new Date(job.startingDate);
        if (!isNaN(d.getTime())) createdJobsByUser.job.startingDate = d.toISOString().split('T')[0];
    }
    if (job.endingDate) {
        const d = new Date(job.endingDate);
        if (!isNaN(d.getTime())) createdJobsByUser.job.endingDate = d.toISOString().split('T')[0];
    }
    if (job.createdAt) {
        const d = new Date(job.createdAt);
        if (!isNaN(d.getTime())) createdJobsByUser.job.createdAt = d.toISOString().split('T')[0];
    }
  }
  
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
