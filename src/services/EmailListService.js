import emailListRepository from '../repositories/EmailListRepository.js';
import AppError from '../utils/AppError.js';

const getAllEmailLists = async () => {
  return await emailListRepository.getAllEmailList();
};

const getEmailListById = async (id) => {
  return await emailListRepository.getEmailListById(id);
};

const createBulkEmailLists = async (data) => {
  const result = await emailListRepository.createBulkEmailLists(data);
  if (result.count === 0) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Listas de email criadas.' };
};

const updateAllIsActive = async (state) => {
  const result = await emailListRepository.updateAllIsActive(state);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Status das listas atualizado.' };
};

const updateEmailList = async (id, data) => {
  const result = await emailListRepository.updateEmailList(data, id);
  if (!result) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Lista de e-mails atualizada.' };
};

const deleteBulkEmailLists = async (idsString) => {
  const ids = idsString.split(',');
  const result = await emailListRepository.deleteBulkEmailLists(ids);
  if (result.count === 0) {
    throw new AppError('Falha ao realizar operação.', 500);
  }
  return { message: 'Listas de e-mail deletadas.' };
};

const getEmailListState = async () => {
  const count = await emailListRepository.countIsActive();
  return { status: count !== 0 };
};

export default {
  getAllEmailLists,
  getEmailListById,
  createBulkEmailLists,
  updateAllIsActive,
  updateEmailList,
  deleteBulkEmailLists,
  getEmailListState
};
