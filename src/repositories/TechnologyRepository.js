import prisma from '../common/prisma/prisma.js';

const getAllTechnologies = async () => {
  const technologies = await prisma.technology.findMany();
  return technologies;
};

const getTechnologyById = async (id) => {
  const technology = await prisma.technology.findUnique({
    where: {
      id: id
    }
  });
  return technology;
};

const createTechnology = async (body) => {
  const { id, ...techData } = body;
  const technology = await prisma.technology.create({
    data: techData
  });
  return technology;
};

const createBulkTechnologies = async (bodies) => {
  // Garantimos que nenhum objeto tenha 'id' se for autoincrement
  const sanitizedBodies = bodies.map(({ id, ...rest }) => rest);
  return await prisma.technology.createMany({
    data: sanitizedBodies
  });
};

const updateTechnology = async (body, id) => {
  try {
    const { id: bodyId, ...techData } = body;
    return await prisma.technology.update({
      where: {
        id: id
      },
      data: techData
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const deleteTechnology = async (id) => {
  try {
    return await prisma.technology.delete({
      where: {
        id: id
      }
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

export default { getAllTechnologies, getTechnologyById, updateTechnology, deleteTechnology, createTechnology, createBulkTechnologies };
