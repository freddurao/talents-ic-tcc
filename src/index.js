import { env } from './utils/env-validator.js';
import express from 'express';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import technologyRoutes from './routes/technologyRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import healthCheckRoutes from './routes/healthCheckRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import cors from 'cors';
import connect from './utils/connection.js';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import { deleteExpiredJobs } from './utils/schedule.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

const fileContents = fs.readFileSync('swagger.yml', 'utf8');
const swaggerDocument = yaml.loadAll(fileContents);

const app = express();

connect();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/vagas', jobRoutes);
app.use('/usuarios', userRoutes);
app.use('/perfis', profileRoutes);
app.use('/tecnologias', technologyRoutes);
app.use('/habilidades', skillRoutes);
app.use('/health-check', healthCheckRoutes);
app.use('/empresas', companyRoutes);

app.use('/api-doc/v1', swaggerUi.serve, swaggerUi.setup(swaggerDocument[0], { explorer: true }));

app.use(errorMiddleware);

deleteExpiredJobs();

app.listen(env.PORT, () => console.log(`Server running at port ${env.PORT}`));
