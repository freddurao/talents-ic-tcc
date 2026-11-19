// Builds where clause for job searching based on GET params for Prisma
export const buildJobWhereClause = (req) => {
  let content = {};
  
  if (req.query.filter) {
    content.OR = [
      { title: { contains: req.query.filter, mode: 'insensitive' } },
      { description: { contains: req.query.filter, mode: 'insensitive' } }
    ];
  }

  if (req.query.type) content.type = { contains: req.query.type, mode: 'insensitive' };
  
  if (req.query.min >= 0 && req.query.max >= 0) {
    content.salary = {
      gte: parseFloat(req.query.min),
      lte: parseFloat(req.query.max)
    };
  }

  if (req.query.site) content.site = { contains: req.query.site, mode: 'insensitive' };
  
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
export const buildProfileWhereClause = (req) => {
  let content = {
    searchable: true
  };

  if (req.query.scholarity) content.scholarity = { contains: req.query.scholarity, mode: 'insensitive' };
  if (req.query.knowledge) content.knowledge = { contains: req.query.knowledge, mode: 'insensitive' };
  if (req.query.technologies) content.technologies = { contains: req.query.technologies, mode: 'insensitive' };
  if (req.query.languages) content.languages = { contains: req.query.languages, mode: 'insensitive' };
  
  return content;
};

// Check if name is in req params
export const buildUserNameWhereClause = (req) => {
  return req.query.name;
};
