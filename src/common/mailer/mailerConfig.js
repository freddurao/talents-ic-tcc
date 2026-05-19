import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { env } from '../../utils/env-validator.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.LOGIN,
    pass: env.PASSWORD,
  },
});

const viewPath = path.resolve('./src/common/mailer/templates/emails');
const partialsPath = path.resolve('./src/common/mailer/templates/partials');
const layoutsPath = path.resolve('./src/common/mailer/templates/layouts');

transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extName: '.hbs',
      partialsDir: partialsPath,
      layoutsDir: layoutsPath,
      defaultLayout: 'main.hbs',
    },
    viewPath: viewPath,
    extName: '.hbs',
  })
);

export default transporter;
