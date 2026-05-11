import repository from '../repositories/EmailListRepository.js';

export const getAllEmailLists = async (req, res) => {
  try {
    const emailList = await repository.getAllEmailList();
    res.status(200).json(emailList);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getEmailListById = async (req, res) => {
  try {
    const emailList = await repository.getEmailListById(req.params.id);
    res.status(200).json(emailList);
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const createBulkEmailLists = async (req, res) => {
  try {
    const result = await repository.createBulkEmailLists(req.body);
    if (result.count > 0)
      res.status(201).json({
        message: 'Listas de email criadas.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const updateAllIsActive = async (req, res) => {
  try {
    const result = await repository.updateAllIsActive(req.body.state);
    if (result)
      res.status(200).json({
        message: 'Status das listas atualizado.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const updateEmailList = async (req, res) => {
  try {
    const result = await repository.updateEmailList(req.body, req.params.id);
    if (result)
      res.status(200).json({
        message: 'Lista de e-mails atualizada.'
      });
    else throw new Error('Falha ao realizar operação.');
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const deleteBulkEmailLists = async (req, res) => {
  try {
    const result = await repository.deleteBulkEmailLists(req.params.ids.split(','));

    if (result.count > 0) {
      res.status(200).json({
        message: 'Listas de e-mail deletadas.'
      });
    } else {
      throw new Error('Falha ao realizar operação.');
    }
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};

export const getEmailListState = async (req, res) => {
  try {
    let status = await repository.countIsActive();

    if (status == 0) {
      res.status(200).json({ status: false });
    } else {
      res.status(200).json({ status: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, error: true });
  }
};
