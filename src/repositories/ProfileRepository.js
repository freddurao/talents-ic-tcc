import prisma from '../common/prisma/prisma.js';
import { pick } from '../utils/pick.js';

// Campos que o formulário de perfil pode gravar (o resto do req.body é ignorado)
const PROFILE_FIELDS = ['searchable', 'birthDate', 'scholarity', 'knowledge', 'technologies', 'languages', 'linkResume'];

const getProfileById = async (id) => {
  const profile = await prisma.profile.findUnique({
    where: {
      id
    },
    // Nome e e-mail para a tela de perfil (os mesmos dados que a lista de perfis já devolve)
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
  return profile;
};

const countProfileByUserId = async (userId) => {
  const count = await prisma.profile.count({
    where: {
      userId
    }
  });
  return count;
};

const getProfileByUserId = async (userId) => {
  const profile = await prisma.profile.findUnique({
    where: {
      userId
    }
  });
  return profile;
};

const getAllProfiles = async (filters, itemsPerPage, pageNumber) => {
  const take = itemsPerPage || undefined;
  const skip = (pageNumber - 1) * itemsPerPage || 0;

  const whereClause = {
    ...filters
  };

  const [profiles, count] = await prisma.$transaction([
    prisma.profile.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      },
      take,
      skip
    }),
    prisma.profile.count({ where: whereClause })
  ]);

  return { rows: profiles, count };
};

const updateProfile = async (body, id) => {
  try {
    const profileData = pick(body, PROFILE_FIELDS);
    const dataToUpdate = { ...profileData };

    if (dataToUpdate.birthDate) dataToUpdate.birthDate = new Date(dataToUpdate.birthDate);
    if (dataToUpdate.searchable !== undefined) dataToUpdate.searchable = String(dataToUpdate.searchable) === 'true' || dataToUpdate.searchable === true;

    const result = await prisma.profile.update({
      where: {
        id
      },
      data: dataToUpdate
    });
    return result;
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const createProfile = async (body) => {
  const { userId } = body; // definido pelo service a partir do token, nunca pelo cliente
  const profileData = pick(body, PROFILE_FIELDS);
  const profile = await prisma.profile.create({
    data: {
      ...profileData,
      userId,
      birthDate: new Date(profileData.birthDate),
      searchable: String(profileData.searchable) === 'true' || profileData.searchable === true
    }
  });
  return profile;
};

const deleteProfile = async (id) => {
  try {
    return await prisma.profile.delete({
      where: {
        id
      }
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

export default {
  updateProfile,
  getAllProfiles,
  getProfileById,
  createProfile,
  deleteProfile,
  getProfileByUserId,
  countProfileByUserId
};
