import repository from '../repositories/JobRepository.js';
import { buildJobWhereClause } from '../utils/filters.js';
import User_JobRepository from '../repositories/User_JobRepository.js';
import auth from '../utils/auth.js';
import ProfileRepository from '../repositories/ProfileRepository.js';
import { mail_sender } from '../utils/emailSender.js';
import UserRepository from '../repositories/UserRepository.js';
import { emailsListMail } from '../utils/emailSender.js';
import User_JobScoreRepository from '../repositories/User_JobScoreRepository.js';
import { recommended_users_to_job } from '../utils/profilesRecommendation.js';

//Get all jobs from db (can return filtered data by HTTP GET params)
export const getAllJobs = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const filters = buildJobWhereClause(req);
    const jobs = await repository.getAllJobs(filters, itemsPerPage, pageNumber);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

//Get a job by given id
export const getJobById = async (req, res) => {
  try {
    const jobInfo = await User_JobRepository.getInformationByJobId(req.params.id);
    
    if (jobInfo) {
      const token = req.headers['x-access-token'];
      if (token) {
        try {
          const { userId } = auth.getTokenProperties(token);
          if (userId == jobInfo.userId) {
            jobInfo['recmd_profiles'] = await recommended_users_to_job(userId, jobInfo.job);
          }
        } catch (authError) {
          
        }
      }
      
      const formattedJobInfo = { ...jobInfo };
      if (formattedJobInfo.job) {
          const job = { ...formattedJobInfo.job };
          if (job.startingDate) {
              const d = new Date(job.startingDate);
              if (!isNaN(d.getTime())) job.startingDate = d.toISOString().split('T')[0];
          }
          if (job.endingDate) {
              const d = new Date(job.endingDate);
              if (!isNaN(d.getTime())) job.endingDate = d.toISOString().split('T')[0];
          }
          if (job.createdAt) {
              const d = new Date(job.createdAt);
              if (!isNaN(d.getTime())) job.createdAt = d.toISOString().split('T')[0];
          }
          formattedJobInfo.job = job;
      }
      
      res.status(200).json(formattedJobInfo);
    } else {
      res.status(404).json({ message: 'Vaga não encontrada.', error: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

//Create new job
export const createJob = async (req, res) => {
  try {
    const userId = req.body.userId;
    auth.checkToken(userId, req.headers['x-access-token']);
    const job = await repository.createJob(req.body, userId);
    if (job) {
      if (req.body.emailsToSend && req.body.emailsToSend.length > 0) {
        await emailsListMail(job, req.body.emailsToSend);
      }
      res.status(201).json({
        message: 'Vaga criada.'
      });
    } else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    if (!error.auth) res.status(500).json({ message: error.message, error: true });
    else res.status(401).json({ message: error.message, error: true, notAuthorized: true });
  }
};

//Update job record on db
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { isAdmin, userId } = auth.getTokenProperties(req.headers['x-access-token']);

    if ((await User_JobRepository.countUser_JobByJobIdAndUserId(jobId, userId)) || isAdmin) {
      await repository.updateJob(req.body, jobId);
      return res.status(200).json({
        message: 'Vaga atualizada.'
      });
    } else res.status(401).json({ message: 'acesso não autorizado.', error: true, notAuthorized: true });
  } catch (error) {
    if (!error.auth) res.status(500).json({ message: error.message, error: true });
    else res.status(401).json({ message: error.message, error: true, notAuthorized: true });
  }
};

export const getFeedbackStatus = async(req, res) => {
  try {
    const jobId = req.params.id;
    const { userId } = auth.getTokenProperties(req.headers['x-access-token']);
    const result = await User_JobScoreRepository.getUser_JobScoreStatus(userId, jobId);
    
    if (result && result.status) {
      return res.status(200).json(result.status);
    } else {
      res.status(401).json({message: 'Acesso não autorizado.', error: true, notAuthorized:true});
    }
  } catch (error) {
    if (!error.auth) res.status(500).json({ message: error.message, error: true });
    else res.status(401).json({ message: error.message, error: true, notAuthorized: true });
  }
};

export const updateStatusJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { userId } = auth.getTokenProperties(req.headers['x-access-token']);
    
    // Verifica se existe o registro antes de atualizar usando o repositório
    const exists = await User_JobScoreRepository.getInformationByJobIdAndUserId(jobId, userId);
    
    if (exists) {
      await User_JobScoreRepository.updateUser_JobScoreStatus(req.body, userId, jobId);
      return res.status(204).json({
        message: 'Status do escore atualizado.'
      });
    } else {
      res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
    }
  } catch (error) {
    if (!error.auth) res.status(500).json({ message: error.message, error: true });
    else res.status(401).json({ message: error.message, error: true, notAuthorized: true });
  }
};

//Delete job from db
export const deleteJob = async (req, res) => {
  try {
    const { userId, isAdmin } = auth.getTokenProperties(req.headers['x-access-token']);
    const jobId = req.params.id;

    if ((await User_JobRepository.countUser_JobByJobIdAndUserId(jobId, userId)) || isAdmin) {
      await repository.deleteJob(jobId);
      return res.status(204).json();
    } else res.status(401).json({ message: 'acesso não autorizado.', error: true, notAuthorized: true });
  } catch (error) {
    if (!error.auth) res.status(500).json({ message: error.message, error: true });
    else res.status(401).json({ message: error.message, error: true, notAuthorized: true });
  }
};

//Apply user to a job and send an email for the job creator
export const applyToJob = async (req, res) => {
  try {
    const userId = req.body.userId;
    auth.checkToken(userId, req.headers['x-access-token']);
    let count = await ProfileRepository.countProfileByUserId(userId);
    if (!count) return res.status(400).json({ message: 'Necessário criar perfil.', error: true, emptyProfile: true });
    
    if (!(await repository.countValidJob(req.body.jobId))) return res.status(400).json({ message: 'Vaga expirada.', error: true });
    
    let userJob;
    try {
      userJob = await repository.applyToJob(userId, req.body.jobId);
    } catch (e) {
      if (e.code === 'P2002') {
        return res.status(400).json({ message: 'Você já se candidatou a esta vaga.', error: true });
      }
      throw e;
    }
    if (userJob) {
      try {
        const userApplier = await UserRepository.getUserById(userId);
        const infoUserRecvAndJob = await User_JobRepository.getInformationByJobId(req.body.jobId);
        const userReceiver = infoUserRecvAndJob.user;
        const profileUserApplier = await ProfileRepository.getProfileByUserId(userId);
        const jobToApply = infoUserRecvAndJob.job;
        await mail_sender(userApplier, userReceiver, profileUserApplier, jobToApply);
      } catch (mailErr) {
        
      }
      res.status(200).json({ message: 'Aplicação realizada.' });
    } else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    if (!error.auth) res.status(500).json({ message: error.message, error: true });
    else res.status(401).json({ message: error.message, error: true, notAuthorized: true });
  }
};
