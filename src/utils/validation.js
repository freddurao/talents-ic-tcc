export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/[^\d]+/g, '');

  if (cleanCNPJ.length !== 14) return false;

  // Reject known invalid CNPJs
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validate verification digits
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;

  return true;
};

// Data de hoje (AAAA-MM-DD) no fuso da Bahia, para não virar o dia antes da hora
// por causa do UTC do servidor
const todayInBahia = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bahia' }).format(new Date());

const isValidDateString = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(`${value}T12:00:00`).getTime());

// Valida o período de candidatura de uma vaga (startingDate = início, endingDate = fim).
// Devolve a mensagem de erro, ou null se estiver tudo certo. Datas no formato AAAA-MM-DD,
// que podem ser comparadas como texto.
export const getJobDatesError = ({ startingDate, endingDate }, { today = todayInBahia() } = {}) => {
  if (!startingDate || !endingDate) {
    return 'Informe o início e o fim do período de candidatura.';
  }
  if (!isValidDateString(startingDate) || !isValidDateString(endingDate)) {
    return 'Datas inválidas. Use o formato AAAA-MM-DD.';
  }
  if (endingDate < startingDate) {
    return 'O fim do período de candidatura não pode ser antes do início.';
  }
  if (endingDate < today) {
    return 'O fim do período de candidatura não pode estar no passado.';
  }
  return null;
};
