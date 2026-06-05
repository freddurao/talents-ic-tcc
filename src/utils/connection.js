import prisma from "../common/prisma/prisma.js";

const connect = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected...');
  } catch (error) {
    console.error('Connection error:', error);
  }
};

export default connect;
