import { findIdsIgnoringAccents } from './unaccentSearch.js';

// Restringe a busca aos IDs encontrados ignorando acentos. Usa AND para que vários
// filtros de texto se combinem (a vaga precisa bater em todos).
const restrictToIds = (content, ids) => {
  content.AND = [...(content.AND || []), { id: { in: ids } }];
};

// Builds where clause for job searching based on GET params for Prisma
export const buildJobWhereClause = async (req) => {
  let content = {};

  if (req.query.filter) {
    restrictToIds(content, await findIdsIgnoringAccents('job', ['title', 'description'], req.query.filter));
  }

  if (req.query.type) content.type = { contains: req.query.type, mode: 'insensitive' };

  if (req.query.min >= 0 && req.query.max >= 0) {
    content.salary = {
      gte: parseFloat(req.query.min),
      lte: parseFloat(req.query.max)
    };
  }

  if (req.query.site) {
    restrictToIds(content, await findIdsIgnoringAccents('job', ['site'], req.query.site));
  }

  if (req.query.chmin >= 0 && req.query.chmax >= 0) {
    content.workload = {
      gte: parseFloat(req.query.chmin),
      lte: parseFloat(req.query.chmax)
    };
  }

  if (req.query.scholarity) content.scholarity = { contains: req.query.scholarity, mode: 'insensitive' };
  if (req.query.companyId) content.companyId = req.query.companyId;
  if (req.query.createdAt) content.createdAt = new Date(req.query.createdAt);

  // Apenas vagas que ainda não expiraram
  content.endingDate = {
    gte: new Date()
  };

  return content;
};

// Builds where clause for profile searching based on GET params
export const buildProfileWhereClause = async (req) => {
  let content = {
    searchable: true
  };

  if (req.query.scholarity) content.scholarity = { contains: req.query.scholarity, mode: 'insensitive' };

  // Campos de texto livre: ignoram acentos e maiúsculas
  for (const field of ['name', 'knowledge', 'technologies', 'languages']) {
    if (req.query[field]) {
      restrictToIds(content, await findIdsIgnoringAccents('profile', [field], req.query[field]));
    }
  }

  return content;
};
