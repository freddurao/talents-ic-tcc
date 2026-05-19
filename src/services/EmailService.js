import transporter from '../common/mailer/mailerConfig.js';
import { env } from '../utils/env-validator.js';

const scholarityMap = {
  supc: 'Superior Completo',
  supinc: 'Superior Incompleto',
  posgrad: 'Pós-Graduação',
  notgrad: 'Não Graduado'
};

const jobTypeMap = {
  estagio: 'Estágio',
  trabalho: 'Trabalho',
  iniccient: 'Iniciação Científica',
  tcc: 'TCC',
  mestrado: 'Mestrado',
  doutorado: 'Doutorado',
  extensao: 'Extensão',
  pesquisa: 'Pesquisa',
  complementar: 'Complementar',
  outro: 'Outro'
};

const sendMail = async (options) => {
  try {
    const info = await transporter.sendMail(options);
    return info;
  } catch (error) {
    console.error(`[EmailService] Error sending email to ${options.to}:`, error);
    return null;
  }
};

export const sendApplicationEmail = async (userApplier, userReceiver, profileUserApplier, jobToApply) => {
  const mailOptions = {
    from: env.LOGIN,
    to: userReceiver.email,
    subject: `Aplicação para a vaga ${jobToApply.title}`,
    template: 'application',
    context: {
      userReceiver,
      userApplier,
      jobToApply,
      knowledge: profileUserApplier.knowledge?.split(';').join(', ') || 'Não informado',
      scholarity: scholarityMap[profileUserApplier.scholarity] || 'Não informado',
      technologies: profileUserApplier.technologies?.split(';').join(', ') || 'Não informado',
      languages: profileUserApplier.languages || 'Não informado',
      resume: profileUserApplier.linkResume || 'Não informado'
    }
  };

  return sendMail(mailOptions);
};

export const sendInviteEmail = async (email, link) => {
  const mailOptions = {
    from: env.LOGIN,
    to: email,
    subject: 'Convite para Talentos-IC',
    template: 'invite',
    context: { link }
  };

  return sendMail(mailOptions);
};

export const sendRecoveryEmail = async (email, link) => {
  const mailOptions = {
    from: env.LOGIN,
    to: email,
    subject: 'Recuperação de Senha (Talentos-IC)',
    template: 'recovery',
    context: { link }
  };

  return sendMail(mailOptions);
};

export const sendJobCreatedEmail = async (job, emailsList) => {
  if (!emailsList || emailsList.length === 0) return;

  const mailOptions = {
    from: env.LOGIN,
    bcc: emailsList, // Use BCC for privacy
    subject: 'Nova Vaga disponível! (Talentos IC)',
    template: 'job-created',
    context: {
      titulo: job.title,
      description: job.description,
      type: jobTypeMap[job.type] || job.type,
      site: job.site,
      workload: job.workload,
      salary: job.salary,
      scholarity: scholarityMap[job.scholarity] || job.scholarity,
      link: env.URL_VAGA + job.id
    }
  };

  return sendMail(mailOptions);
};

export default {
  sendApplicationEmail,
  sendInviteEmail,
  sendRecoveryEmail,
  sendJobCreatedEmail
};
