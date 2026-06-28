// Builds where clause for job searching based on GET params for Prisma
export const buildJobWhereClause = (req) => {
  let content = {};
  
  if (req.query.filter) {
    content.OR = [
      { title: { contains: req.query.filter } },
      { description: { contains: req.query.filter } }
    ];
  }

  if (req.query.type) content.type = { contains: req.query.type };
  
  if (req.query.min >= 0 && req.query.max >= 0) {
    content.salary = {
      gte: parseFloat(req.query.min),
      lte: parseFloat(req.query.max)
    };
  }

  if (req.query.site) content.site = { contains: req.query.site };
  
  if (req.query.chmin >= 0 && req.query.chmax >= 0) {
    content.workload = {
      gte: parseFloat(req.query.chmin),
      lte: parseFloat(req.query.chmax)
    };
  }

  if (req.query.scholarity) content.scholarity = { contains: req.query.scholarity };
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

  if (req.query.scholarity) content.scholarity = { contains: req.query.scholarity };
  if (req.query.knowledge) content.knowledge = { contains: req.query.knowledge };
  if (req.query.technologies) content.technologies = { contains: req.query.technologies };
  if (req.query.languages) content.languages = { contains: req.query.languages };
  
  return content;
};

// Check if name is in req params
export const buildUserNameWhereClause = (req) => {
  return req.query.name;
};
