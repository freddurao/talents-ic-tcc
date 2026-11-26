// Copia de um objeto (geralmente o req.body) só os campos permitidos.
// Evita *mass assignment*: campos extras, como companyId, ou relações aninhadas
// do Prisma, como { company: { connect: ... } }, nunca chegam ao banco.
export const pick = (source, fields) =>
  Object.fromEntries(
    fields.filter((field) => source?.[field] !== undefined).map((field) => [field, source[field]])
  );
