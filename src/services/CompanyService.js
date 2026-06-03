import repository from '../repositories/CompanyRepository.js';
import AppError from '../utils/AppError.js';

const requestCompanyCreation = async (userId, companyData) => {
  // Validate CNPJ uniqueness before attempting creation if needed, 
  // but Prisma will throw error anyway.
  
  try {
    const company = await repository.createCompany(companyData);
    const request = await repository.createRequest(userId, company.id);
    return { company, request };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError('Este CNPJ já está cadastrado ou em processo de aprovação.', 400);
    }
    throw error;
  }
};

const listPendingRequests = async (requestingUser) => {
  if (requestingUser.role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }
  return await repository.getPendingRequests();
};

const approveRequest = async (requestId, requestingUser) => {
  if (requestingUser.role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }
  return await repository.updateRequestStatus(requestId, 'APPROVED');
};

const rejectRequest = async (requestId, requestingUser) => {
  if (requestingUser.role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }
  return await repository.updateRequestStatus(requestId, 'REJECTED');
};

const getAllCompanies = async () => {
  return await repository.getAllCompanies();
};

export default {
  requestCompanyCreation,
  listPendingRequests,
  approveRequest,
  rejectRequest,
  getAllCompanies
};
