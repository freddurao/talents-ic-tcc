import Joi from 'joi';
import 'dotenv/config';

const envSchema = Joi.object({
  PORT: Joi.number().port().default(5000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_USER: Joi.string(),
  DATABASE_PASSWORD: Joi.string(),
  DATABASE_NAME: Joi.string(),
  DATABASE_HOST: Joi.string(),
  DATABASE_PORT: Joi.number().port(),

  // Auth
  SECRET: Joi.string().required(),
  SECRET_ADM: Joi.string().required(),

  // Email
  LOGIN: Joi.string().required(),
  PASSWORD: Joi.string().required(),
  
  // URLs
  SIGNUP_URL: Joi.string().uri().required(),
  RECOVERY_URL: Joi.string().uri().required(),
  URL_VAGA: Joi.string().uri().required(),
})
  .unknown(true)
  .required();

const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  const isTest = process.env.NODE_ENV === 'test';
  const errorMessages = error.details
    .map((detail) => detail.message)
    .join('\n');
    
  if (isTest) {
    console.warn('⚠️  Avisos de variáveis de ambiente em ambiente de TESTE:\n', errorMessages);
  } else {
    console.error('❌ Erro nas variáveis de ambiente:\n', errorMessages);
    process.exit(1);
  }
}

export const env = value;
