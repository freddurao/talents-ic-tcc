import prisma from '../common/prisma/prisma.js';

const getAllSkills = async () => {
  const skills = await prisma.skill.findMany();
  return skills;
};

const getSkillById = async (id) => {
  const skill = await prisma.skill.findUnique({
    where: {
      id: Number(id)
    }
  });
  return skill;
};

const createSkill = async (body) => {
  const { id, ...skillData } = body;
  const skill = await prisma.skill.create({
    data: skillData
  });
  return skill;
};

const createBulkSkills = async (bodies) => {
  // Garantimos que nenhum objeto tenha 'id' se for autoincrement
  const sanitizedBodies = bodies.map(({ id, ...rest }) => rest);
  return await prisma.skill.createMany({
    data: sanitizedBodies
  });
};

const updateSkill = async (body, id) => {
  try {
    const { id: bodyId, ...skillData } = body;
    return await prisma.skill.update({
      where: {
        id: Number(id)
      },
      data: skillData
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const deleteSkill = async (id) => {
  try {
    return await prisma.skill.delete({
      where: {
        id: Number(id)
      }
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

export default { getAllSkills, getSkillById, updateSkill, deleteSkill, createSkill, createBulkSkills };
