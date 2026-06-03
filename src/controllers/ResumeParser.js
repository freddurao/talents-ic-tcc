import multer from 'multer'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Formato nao suportado. Use PDF ou TXT.'))
    }
  },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Remove diacritics/accents so "Português" matches keyword "portugues"
function stripAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return match ? match[0] : null
}

function extractName(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && l.length < 60)
    .filter((l) => !/[@\d/]/.test(l))
  return lines[0] ?? null
}

function extractBirthDate(text) {
  const patterns = [
    /nasc[a-z.]*[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    /data de nascimento[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    /(\d{1,2}[/-]\d{1,2}[/-]\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return normalizeDate(match[1])
  }
  return null
}

function normalizeDate(dateStr) {
  if (!dateStr) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const parts = dateStr.split(/[/-]/)
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function extractScholarity(text) {
  // Use accent-stripped text so "pós-graduação" matches "pos-graduacao"
  // Returns the value key used by jobScholarities ('supc', 'supinc', 'posgrad', 'notgrad')
  const lower = stripAccents(text).toLowerCase()
  const map = [
    { keywords: ['doutorado', 'phd', 'ph.d'], value: 'posgrad' },
    { keywords: ['mestrado', 'mestre', 'msc', 'm.sc'], value: 'posgrad' },
    {
      keywords: ['pos-graduacao', 'pos graduacao', 'especializa', 'lato sensu'],
      value: 'posgrad',
    },
    {
      keywords: [
        'superior completo',
        'graduado',
        'bacharel',
        'licenciado',
        'formado',
      ],
      value: 'supc',
    },
    {
      keywords: ['superior incompleto', 'cursando', 'graduando', 'universitario'],
      value: 'supinc',
    },
    {
      keywords: ['ensino medio', 'segundo grau', 'colegial'],
      value: 'notgrad',
    },
    { keywords: ['ensino fundamental', 'primeiro grau'], value: 'notgrad' },
  ]
  for (const { keywords, value } of map) {
    if (keywords.some((k) => lower.includes(k))) return value
  }
  return null
}

function extractLanguages(text) {
  // Root cause fix: strip accents from text before matching so "Português" → "Portugues"
  // matches the accent-free keyword "portugues". Labels in the map keep proper accents.
  const knownLanguages = [
    { search: 'portugues', label: 'Português' },
    { search: 'ingles', label: 'Inglês' },
    { search: 'espanhol', label: 'Espanhol' },
    { search: 'frances', label: 'Francês' },
    { search: 'alemao', label: 'Alemão' },
    { search: 'italiano', label: 'Italiano' },
    { search: 'japones', label: 'Japonês' },
    { search: 'chines', label: 'Chinês' },
    { search: 'mandarim', label: 'Mandarim' },
    { search: 'russo', label: 'Russo' },
    { search: 'coreano', label: 'Coreano' },
    { search: 'arabe', label: 'Árabe' },
    { search: 'hindi', label: 'Hindi' },
    { search: 'holandes', label: 'Holandês' },
    { search: 'sueco', label: 'Sueco' },
    { search: 'noruegues', label: 'Norueguês' },
    { search: 'portuguese', label: 'Português' },
    { search: 'english', label: 'Inglês' },
    { search: 'spanish', label: 'Espanhol' },
    { search: 'french', label: 'Francês' },
    { search: 'german', label: 'Alemão' },
    { search: 'italian', label: 'Italiano' },
    { search: 'japanese', label: 'Japonês' },
    { search: 'chinese', label: 'Chinês' },
    { search: 'russian', label: 'Russo' },
    { search: 'korean', label: 'Coreano' },
    { search: 'arabic', label: 'Árabe' },
    { search: 'dutch', label: 'Holandês' },
    { search: 'swedish', label: 'Sueco' },
  ]
  const normalized = stripAccents(text).toLowerCase()
  const found = knownLanguages.filter((lang) => normalized.includes(lang.search))
  const labels = found.map((lang) => lang.label)
  return [...new Set(labels)].join(';')
}

function extractTechnologies(text) {
  const known = [
    'javascript',
    'typescript',
    'python',
    'java',
    'kotlin',
    'swift',
    'c#',
    'c++',
    'php',
    'ruby',
    'go',
    'rust',
    'scala',
    'r',
    'react',
    'angular',
    'vue',
    'next.js',
    'nuxt',
    'svelte',
    'node.js',
    'express',
    'fastapi',
    'django',
    'flask',
    'spring',
    'laravel',
    'mysql',
    'postgresql',
    'mongodb',
    'redis',
    'sqlite',
    'oracle',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'linux',
    'git',
    'github',
    'gitlab',
    'jenkins',
    'ci/cd',
    'html',
    'css',
    'sass',
    'tailwind',
    'bootstrap',
    'graphql',
    'rest',
    'api',
    'microservices',
    'tensorflow',
    'pytorch',
    'pandas',
    'numpy',
    'scikit',
    'figma',
    'photoshop',
    'illustrator',
  ]
  const lower = text.toLowerCase()
  const found = known.filter((tech) => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`).test(lower)
  })
  return [...new Set(found)].map(capitalize).join(';')
}

function extractKnowledge(text) {
  // Strip accents from both text and keywords so "Comunicação" matches keyword "Comunicacao"
  const known = [
    'Liderança',
    'Comunicação',
    'Trabalho em equipe',
    'Proatividade',
    'Criatividade',
    'Organização',
    'Responsabilidade',
    'Autonomia',
    'Flexibilidade',
    'Adaptabilidade',
    'Resolução de problemas',
    'Pensamento crítico',
    'Inteligência emocional',
    'Empatia',
    'Negociação',
    'Persuasão',
    'Gestão de tempo',
    'Planejamento',
    'Tomada de decisão',
    'Foco em resultados',
    'Orientação ao cliente',
    'Multitarefa',
    'Atenção aos detalhes',
    'Leadership',
    'Communication',
    'Teamwork',
    'Proactive',
    'Creativity',
    'Organization',
    'Responsibility',
    'Autonomy',
    'Flexibility',
    'Adaptability',
    'Problem solving',
    'Critical thinking',
    'Emotional intelligence',
    'Empathy',
    'Negotiation',
    'Time management',
    'Planning',
    'Decision making',
  ]
  const strippedText = stripAccents(text).toLowerCase()
  const found = known.filter((skill) =>
    strippedText.includes(stripAccents(skill).toLowerCase())
  )
  return [...new Set(found)].join(';')
}

// ─── Controller ──────────────────────────────────────────────────────────────

export const extractResumeData = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'Nenhum arquivo enviado.', error: true })
    }

    const { mimetype, buffer } = req.file
    let text = ''

    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer)
      text = data.text
    } else {
      text = buffer.toString('utf-8')
    }

    if (!text || text.trim().length === 0) {
      return res.status(422).json({
        message: 'Nao foi possivel extrair texto do arquivo.',
        error: true,
      })
    }

    const parsed = {
      name: extractName(text),
      email: extractEmail(text),
      birthDate: extractBirthDate(text),
      scholarity: extractScholarity(text),
      languages: extractLanguages(text),
      technologies: extractTechnologies(text),
      knowledge: extractKnowledge(text),
    }

    res.json({ data: parsed })
  } catch (error) {
    console.error('[ResumeParser] Error:', error.message)
    res.status(500).json({ message: 'Erro ao processar curriculo.', error: true })
  }
}
