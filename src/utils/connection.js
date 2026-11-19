import prisma from "../common/prisma/prisma.js";

const connect = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected...');
  } catch (error) {
    console.error('Connection error:', error);
    return;
  }

  // Extensão usada pelas buscas que ignoram acentos (utils/unaccentSearch.js)
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS unaccent`;
  } catch (error) {
    console.error('Não foi possível ativar a extensão unaccent do PostgreSQL. As buscas por texto vão falhar:', error.message);
  }
};

export default connect;
