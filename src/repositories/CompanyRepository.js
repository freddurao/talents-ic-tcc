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

const getRequestById = async (id) => {
  return await prisma.companyRequest.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          users: true
        }
      }
    }
  });
};

const getPendingRequests = async () => {
  return await prisma.companyRequest.findMany({
    where: {
      status: 'PENDING',
      company: {
        users: {
          none: {}
        }
      }
    },
    include: {
      user: {
        select: { name: true, email: true }
      },
      company: true
    }
  });
};

const getPendingAssociationRequests = async (companyId) => {
  return await prisma.companyRequest.findMany({
    where: {
      status: 'PENDING',
      companyId,
      company: {
        users: {
          some: {}
        }
      }
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
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

const linkUserToCompany = async (userId, companyId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { companyId }
  });
};

const getAllCompanies = async () => {
  return await prisma.company.findMany({
    where: {
      companyRequests: {
        some: {
          status: 'APPROVED'
        }
      }
    }
  });
};

export default {
  createCompany,
  createRequest,
  getRequestById,
  getPendingRequests,
  getPendingAssociationRequests,
  updateRequestStatus,
  linkUserToCompany,
  getAllCompanies
};
