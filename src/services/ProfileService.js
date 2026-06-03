import profileRepository from '../repositories/ProfileRepository.js';
import jobRepository from '../repositories/JobRepository.js';
import { recommended_vacancy } from '../utils/vacancyRecommendation.js';
import AppError from '../utils/AppError.js';

const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

const formatProfile = (profile) => {
  if (!profile) return null;
  const formatted = { ...profile };
  if (formatted.birthDate) {
    formatted.birthDate = formatDate(new Date(formatted.birthDate));
  }
  return formatted;
};

const getAllProfiles = async (filters, itemsPerPage, pageNumber, name) => {
  const result = await profileRepository.getAllProfiles(filters, itemsPerPage, pageNumber, name);
  result.rows = result.rows.map(formatProfile);
  return result;
};

const getProfileById = async (profileId, requestingUser) => {
  const profile = await profileRepository.getProfileById(profileId);
  if (!profile) {
    throw new AppError('Perfil não encontrado.', 404);
  }

  if (!profile.searchable) {
    const { userId, role } = requestingUser;
    if (profile.userId !== userId && role !== 'ADMIN') {
      throw new AppError('Acesso não autorizado.', 401);
    }
  }

  return formatProfile(profile);
};

const getOwnPerfil = async (userId) => {
  const profile = await profileRepository.getProfileByUserId(userId);
  if (!profile) {
    throw new AppError('Perfil não encontrado.', 404);
  }

  let bestJobs = [];
  const vagas = await recommended_vacancy(userId, profile);
  if (vagas) {
    bestJobs = await Promise.all(vagas.map(async (v) => await jobRepository.getJobById(v.id)));
  }
  return bestJobs;
};

const createProfile = async (profileData, userId) => {
  profileData.userId = userId;
  const profile = await profileRepository.createProfile(profileData);
  if (!profile) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Perfil criado.' };
};

const updateProfile = async (profileId, profileData, userId) => {
  const profile = await profileRepository.getProfileById(profileId);
  if (!profile) {
    throw new AppError('Perfil não encontrado.', 404);
  }

  if (profile.userId != userId) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  const result = await profileRepository.updateProfile(profileData, profileId);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Perfil atualizado.' };
};

const deleteProfile = async (profileId, userId) => {
  const profile = await profileRepository.getProfileByUserId(userId);

  if (!profile || profile.id != profileId) {
    throw new AppError('Acesso não autorizado.', 401);
  }

  const result = await profileRepository.deleteProfile(profile.id);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
};

export default {
  getAllProfiles,
  getProfileById,
  getOwnPerfil,
  createProfile,
  updateProfile,
  deleteProfile
};
