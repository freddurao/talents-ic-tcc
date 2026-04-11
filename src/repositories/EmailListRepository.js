import prisma from '../common/prisma/prisma.js';

const getAllEmailList = async (itemsPerPage, pageNumber) => {
  const take = itemsPerPage || undefined;
  const skip = (pageNumber - 1) * itemsPerPage || 0;

  const [emails, count] = await prisma.$transaction([
    prisma.emailList.findMany({
      take,
      skip
    }),
    prisma.emailList.count()
  ]);

  return { rows: emails, count };
};

const getEmailListById = async (id) => {
  return prisma.emailList.findUnique({
    where: {
      id: Number(id)
    }
  });
};

const createEmailList = async (body) => {
  const emailList = await prisma.emailList.create({
    data: body
  });
  return emailList;
};

const createBulkEmailLists = async (bodies) => {
  return await prisma.emailList.createMany({
    data: bodies
  });
};

const updateEmailList = async (body, id) => {
  try {
    return await prisma.emailList.update({
      where: {
        id: Number(id)
      },
      data: body
    });
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const updateAllIsActive = async (state) => {
  return await prisma.emailList.updateMany({
    data: {
      isActive: state
    }
  });
};

const deleteEmailList = async (id) => {
  try {
    await prisma.emailList.delete({
      where: {
        id: Number(id)
      }
    });
    return 1;
  } catch (error) {
    throw new Error('falha na operação.');
  }
};

const deleteBulkEmailLists = async (ids) => {
  return await prisma.emailList.deleteMany({
    where: {
      id: {
        in: ids.map(id => Number(id))
      }
    }
  });
};

const getEmailByEmail = async (email) => {
  const email_object = await prisma.emailList.findFirst({
    where: {
      email: email
    }
  });
  return email_object;
};

const countIsActive = async () => {
  return await prisma.emailList.count({
    where: {
      isActive: true
    }
  });
};

export default { 
  getAllEmailList, 
  getEmailListById, 
  updateEmailList, 
  deleteEmailList, 
  createEmailList, 
  createBulkEmailLists,
  deleteBulkEmailLists,
  getEmailByEmail, 
  countIsActive,
  updateAllIsActive
};
