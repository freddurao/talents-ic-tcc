import pkg from '@prisma/client';
import prisma from '../common/prisma/prisma.js';

const { Prisma } = pkg;

// Onde cada busca de texto acontece. Tabelas e colunas vêm só desta lista, nunca da
// requisição: são as únicas partes do SQL montadas como texto (o termo vai como parâmetro).
const TARGETS = {
  job: {
    from: 'jobs j',
    id: 'j.id',
    columns: { title: 'j.title', description: 'j.description', site: 'j.site' }
  },
  profile: {
    from: 'user_profiles p JOIN users u ON u.id = p.user_id',
    id: 'p.id',
    columns: {
      knowledge: 'p.knowledge',
      technologies: 'p.technologies',
      languages: 'p.languages',
      name: 'u.name'
    }
  }
};

// Escapa os curingas do LIKE para que "%" e "_" digitados sejam buscados literalmente.
const escapeLike = (term) => term.replace(/[\\%_]/g, '\\$&');

// Devolve os IDs dos registros em que algum dos campos contém o termo, ignorando
// acentos e maiúsculas ("estagio" encontra "Estágio"). O Prisma não oferece isso
// nativamente, então usamos a extensão unaccent do PostgreSQL (ativada em connection.js).
export const findIdsIgnoringAccents = async (target, fields, term) => {
  const { from, id, columns } = TARGETS[target];
  const pattern = `%${escapeLike(String(term))}%`;

  const conditions = fields.map((field) => {
    if (!columns[field]) throw new Error(`Campo de busca desconhecido: ${target}.${field}`);
    return Prisma.sql`unaccent(${Prisma.raw(columns[field])}) ILIKE unaccent(${pattern})`;
  });

  const rows = await prisma.$queryRaw`
    SELECT ${Prisma.raw(id)} AS id
    FROM ${Prisma.raw(from)}
    WHERE ${Prisma.join(conditions, ' OR ')}
  `;
  return rows.map((row) => row.id);
};
