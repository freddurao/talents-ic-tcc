import repository from '../repositories/ProfileRepository.js';
import auth from '../utils/auth.js';
import { buildProfileWhereClause, buildUserNameWhereClause } from '../utils/filters.js';
import { recommended_vacancy } from '../utils/vacancyRecommendation.js';
import JobRepository from '../repositories/JobRepository.js';

//Get all searchable profiles
export const getAllProfiles = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber);
    const itemsPerPage = parseInt(req.query.itemsPerPage);
    const filters = buildProfileWhereClause(req);
    const name = buildUserNameWhereClause(req);
    const profiles = await repository.getAllProfiles(filters, itemsPerPage, pageNumber, name);

    profiles.rows = profiles.rows.map((profile) => {
      if (profile.birthDate) {
        const d = new Date(profile.birthDate);
        if (!isNaN(d.getTime())) profile.birthDate = d.toISOString().split('T')[0];
      }
      return profile;
    });

    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await repository.getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado.', error: true });
    }

    if (!profile.searchable) {
      const { userId, isAdmin } = req.user;
      if (profile.userId != userId && !isAdmin) {
        return res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
      }
    }

    if (profile.birthDate) {
      const d = new Date(profile.birthDate);
      if (!isNaN(d.getTime())) profile.birthDate = d.toISOString().split('T')[0];
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getOwnPerfil = async (req, res) => {
  try {
    const { userId } = req.user;
    const profile = await repository.getProfileByUserId(userId);
    if (profile) {
      if (profile.userId == userId) {
        let bestJobs = [];
        const vagas = await recommended_vacancy(userId, profile);
        if (vagas) {
          bestJobs = await Promise.all(vagas.map(async (i) => await JobRepository.getJobById(i.id)));
        }
        res.status(200).json(bestJobs);
      }
    } else res.status(401).json({ message: 'Acesso não autorizado.', error: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const profile = await repository.getProfileById(req.params.id);
    if (profile) {
      if (profile.userId == userId) {
        const result = await repository.updateProfile(req.body, req.params.id);
        if (result)
          res.status(200).json({
            message: 'Perfil atualizado.'
          });
        else throw new Error('Falha ao realizar operação.');
      } else res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
    } else res.status(404).json({ message: 'Perfil não encontrado.', error: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const createProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    // Ensure the userId in body matches the authenticated user
    req.body.userId = userId;
    const profile = await repository.createProfile(req.body);
    if (profile)
      res.status(201).json({
        message: 'Perfil criado.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const profile = await repository.getProfileByUserId(userId);

    if (profile && profile.id == req.params.id) {
      const result = await repository.deleteProfile(profile.id);
      if (result)
        res.status(204).json({
          message: 'Perfil deletado.'
        });
      else throw new Error('Falha ao realizar operação.');
    } else res.status(401).json({ message: 'Acesso não autorizado.', error: true, notAuthorized: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};
