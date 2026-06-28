import repository from '../repositories/CompanyRepository.js';
import userRepository from '../repositories/UserRepository.js';
import AppError from '../utils/AppError.js';
import { validateCNPJ } from '../utils/validation.js';

const requestCompanyCreation = async (requestingUser, companyData) => {
  if (requestingUser.role === 'ADMIN') {
    throw new AppError('Administradores não podem se associar a empresas.', 400);
  }
  if (!validateCNPJ(companyData.cnpj)) {
    throw new AppError('CNPJ inválido.', 400);
  }
  try {
    const company = await repository.createCompany(companyData);
    const request = await repository.createRequest(requestingUser.userId, company.id);
    return { company, request };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError('Este CNPJ já está cadastrado ou em processo de aprovação.', 400);
    }
    throw error;
  }
};

const requestCompanyAssociation = async (requestingUser, companyId) => {
  if (requestingUser.role === 'ADMIN') {
    throw new AppError('Administradores não podem se associar a empresas.', 400);
  }
  return await repository.createRequest(requestingUser.userId, companyId);
};

const listPendingRequests = async (requestingUser) => {
  if (requestingUser.role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }
  return await repository.getPendingRequests();
};

const listPendingAssociationRequests = async (requestingUser) => {
  const dbUser = await userRepository.getUserById(requestingUser.userId);
  if (!dbUser || !dbUser.companyId) {
    throw new AppError('Você não pertence a nenhuma empresa.', 401);
  }
  return await repository.getPendingAssociationRequests(dbUser.companyId);
};

const approveRequest = async (requestId, requestingUser) => {
  if (requestingUser.role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }
  const request = await repository.getRequestById(requestId);
  if (!request) {
    throw new AppError('Solicitação não encontrada.', 404);
  }
  const result = await repository.updateRequestStatus(requestId, 'APPROVED');
  await repository.linkUserToCompany(request.userId, request.companyId);
  return result;
};

const rejectRequest = async (requestId, requestingUser) => {
  if (requestingUser.role !== 'ADMIN') {
    throw new AppError('Acesso não autorizado.', 401);
  }
  return await repository.updateRequestStatus(requestId, 'REJECTED');
};

const approveAssociationRequest = async (requestId, requestingUser) => {
  const request = await repository.getRequestById(requestId);
  if (!request) {
    throw new AppError('Solicitação não encontrada.', 404);
  }
  const dbUser = await userRepository.getUserById(requestingUser.userId);
  if (requestingUser.role !== 'ADMIN' && (!dbUser || dbUser.companyId !== request.companyId)) {
    throw new AppError('Acesso não autorizado.', 401);
  }
  const result = await repository.updateRequestStatus(requestId, 'APPROVED');
  await repository.linkUserToCompany(request.userId, request.companyId);
  return result;
};

const rejectAssociationRequest = async (requestId, requestingUser) => {
  const request = await repository.getRequestById(requestId);
  if (!request) {
    throw new AppError('Solicitação não encontrada.', 404);
  }
  const dbUser = await userRepository.getUserById(requestingUser.userId);
  if (requestingUser.role !== 'ADMIN' && (!dbUser || dbUser.companyId !== request.companyId)) {
    throw new AppError('Acesso não autorizado.', 401);
  }
  return await repository.updateRequestStatus(requestId, 'REJECTED');
};

const getAllCompanies = async () => {
  return await repository.getAllCompanies();
};

const leaveCompany = async (userId) => {
  return await repository.linkUserToCompany(userId, null);
};

export default {
  requestCompanyCreation,
  requestCompanyAssociation,
  listPendingRequests,
  listPendingAssociationRequests,
  approveRequest,
  rejectRequest,
  approveAssociationRequest,
  rejectAssociationRequest,
  getAllCompanies,
  leaveCompany
};
