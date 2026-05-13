import jobRepository from '../repositories/JobRepository.js';
import userJobRepository from '../repositories/User_JobRepository.js';
import profileRepository from '../repositories/ProfileRepository.js';
import userRepository from '../repositories/UserRepository.js';
import userJobScoreRepository from '../repositories/User_JobScoreRepository.js';
import { mail_sender, emailsListMail } from '../utils/emailSender.js';
import { recommended_users_to_job } from '../utils/profilesRecommendation.js';
import AppError from '../utils/AppError.js';
import auth from '../utils/auth.js';

const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

const formatJob = (job) => {
  if (!job) return null;
  const formatted = { ...job };
  formatted.startingDate = formatDate(formatted.startingDate);
  formatted.endingDate = formatDate(formatted.endingDate);
  formatted.createdAt = formatDate(formatted.createdAt);
  return formatted;
};

const getAllJobs = async (filters, itemsPerPage, pageNumber) => {
  const result = await jobRepository.getAllJobs(filters, itemsPerPage, pageNumber);
  result.rows = result.rows.map(formatJob);
  return result;
};

const getJobById = async (jobId, authHeader) => {
  const jobInfo = await userJobRepository.getInformationByJobId(jobId);
  if (!jobInfo) {
    throw new AppError('Vaga não encontrada.', 404);
  }

  // Recommendation logic
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { userId } = auth.getTokenProperties(token);
      if (userId == jobInfo.userId) {
        jobInfo['recmd_profiles'] = await recommended_users_to_job(userId, jobInfo.job);
      }
    } catch (authError) {
      // Ignore auth errors for recommendations
    }
  }

  // Format job dates
  if (jobInfo.job) {
    jobInfo.job = formatJob(jobInfo.job);
  }

  return jobInfo;
};

const createJob = async (jobData, userId) => {
  const job = await jobRepository.createJob(jobData, userId);
  if (!job) {
    throw new AppError('Falha ao realizar operação.', 500);
  }

  if (jobData.emailsToSend && jobData.emailsToSend.length > 0) {
    try {
      await emailsListMail(job, jobData.emailsToSend);
    } catch (mailError) {
      console.error('Failed to send job creation emails:', mailError);
    }
  }

  return { message: 'Vaga criada.' };
};

const updateJob = async (jobId, jobData, user) => {
  const { isAdmin, userId } = user;

  const isOwner = await userJobRepository.countUser_JobByJobIdAndUserId(jobId, userId);
  if (!isOwner && !isAdmin) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  await jobRepository.updateJob(jobData, jobId);
  return { message: 'Vaga atualizada.' };
};

const deleteJob = async (jobId, user) => {
  const { isAdmin, userId } = user;

  const isOwner = await userJobRepository.countUser_JobByJobIdAndUserId(jobId, userId);
  if (!isOwner && !isAdmin) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  await jobRepository.deleteJob(jobId);
};

const applyToJob = async (userId, jobId) => {
  // Check profile existence
  const profileCount = await profileRepository.countProfileByUserId(userId);
  if (!profileCount) {
    const error = new AppError('Necessário criar perfil.', 400);
    error.emptyProfile = true;
    throw error;
  }

  // Check job validity
  const isValidJob = await jobRepository.countValidJob(jobId);
  if (!isValidJob) {
    throw new AppError('Vaga expirada.', 400);
  }

  try {
    const userJob = await jobRepository.applyToJob(userId, jobId);
    if (!userJob) {
      throw new AppError('Falha ao realizar operação.', 500);
    }

    // Async email notification
    try {
      const userApplier = await userRepository.getUserById(userId);
      const infoUserRecvAndJob = await userJobRepository.getInformationByJobId(jobId);
      const userReceiver = infoUserRecvAndJob.user;
      const profileUserApplier = await profileRepository.getProfileByUserId(userId);
      const jobToApply = infoUserRecvAndJob.job;
      
      // We don't await this to make the response faster, 
      // or we await it but catch errors to ensure resilience.
      mail_sender(userApplier, userReceiver, profileUserApplier, jobToApply)
        .catch(err => console.error('Failed to send application email:', err));
        
    } catch (infoError) {
      console.error('Failed to gather info for application email:', infoError);
    }

    return { message: 'Aplicação realizada.' };
  } catch (e) {
    if (e.code === 'P2002') {
      throw new AppError('Você já se candidatou a esta vaga.', 400);
    }
    throw e;
  }
};

const getFeedbackStatus = async (jobId, userId) => {
  const result = await userJobScoreRepository.getUser_JobScoreStatus(userId, jobId);
  if (result && result.status) {
    return result.status;
  }
  throw new AppError('Acesso não autorizado.', 401);
};

const updateStatusJob = async (jobId, userId, statusData) => {
  const exists = await userJobScoreRepository.getInformationByJobIdAndUserId(jobId, userId);
  if (!exists) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  await userJobScoreRepository.updateUser_JobScoreStatus(statusData, userId, jobId);
  return { message: 'Status do escore atualizado.' };
};

export default {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getFeedbackStatus,
  updateStatusJob
};
