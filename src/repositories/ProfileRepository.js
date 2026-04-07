import prisma from '../common/prisma/prisma.js';

const getProfileById = async (id) => {
  const profile = await prisma.profile.findUnique({
    where: {
      id: Number(id)
    }
  });
  return profile;
};

const countProfileByUserId = async (userId) => {
  const count = await prisma.profile.count({
    where: {
      userId: Number(userId)
    }
  });
  return count;
};

const getProfileByUserId = async (userId) => {
  const profile = await prisma.profile.findUnique({
    where: {
      userId: Number(userId)
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
    whereClause.user = nameFilter;
  }

  const [profiles, count] = await prisma.$transaction([
    prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isAdmin: true,
            isAuthorized: true
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
        id: Number(id)
      },
      data: dataToUpdate
    });
    return [1];
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const createProfile = async (body) => {
  const { userId, ...profileData } = body;
  const profile = await prisma.profile.create({
    data: {
      ...profileData,
      userId: Number(userId),
      birthDate: new Date(profileData.birthDate),
      searchable: String(profileData.searchable) === 'true' || profileData.searchable === true
    }
  });
  return profile;
};

const deleteProfile = async (id) => {
  try {
    await prisma.profile.delete({
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
  updateProfile,
  getAllProfiles,
  getProfileById,
  createProfile,
  deleteProfile,
  getProfileByUserId,
  countProfileByUserId
};
