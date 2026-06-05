import prisma from '../common/prisma/prisma.js';

const createCompany = async (data) => {
  return await prisma.company.create({
    data
  });
};

const createRequest = async (userId, companyId) => {
  return await prisma.companyRequest.create({
    data: {
      userId,
      companyId,
      status: 'PENDING'
    }
  });
};

const getPendingRequests = async () => {
  return await prisma.companyRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: { name: true, email: true }
      },
      company: true
    }
  });
};

const updateRequestStatus = async (id, status) => {
  return await prisma.companyRequest.update({
    where: { id },
    data: { 
      status,
      reviewedAt: new Date()
    }
  });
};

const getAllCompanies = async () => {
  return await prisma.company.findMany();
};

export default {
  createCompany,
  createRequest,
  getPendingRequests,
  updateRequestStatus,
  getAllCompanies
};
