import prisma from '../common/prisma/prisma.js';

const getProfileById = async (id) => {
  const profile = await prisma.profile.findUnique({
    where: {
      id
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

const getAllProfiles = async (filters, itemsPerPage, pageNumber, nameFilter) => {
  const take = itemsPerPage || undefined;
  const skip = (pageNumber - 1) * itemsPerPage || 0;

  const whereClause = {
    ...filters
  };
  
  if (nameFilter) {
    whereClause.user = {
      name: {
        contains: nameFilter,
        mode: 'insensitive'
      }
    };
  }

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
    const { userId, ...profileData } = body;
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
  const { userId, ...profileData } = body;
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
