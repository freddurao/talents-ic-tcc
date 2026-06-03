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

// ─── Extrators ───────────────────────────────────────────────────────────────

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return match ? match[0] : null
}

function extractName(text) {
  // Pega as primeiras linhas nao vazias — geralmente o nome esta no topo
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && l.length < 60)
    .filter((l) => !/[@\d\/]/.test(l)) // ignora linhas com email, numeros, datas
  return lines[0] ?? null
}

function extractBirthDate(text) {
  // Procura padroes como "Nascimento: 15/03/1995" ou "nasc. 1995-03-15"
  const patterns = [
    /nasc[a-z.]*[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i,
    /data de nascimento[:\s]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i,
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return normalizeDate(match[1])
    }
  }
  return null
}

function normalizeDate(dateStr) {
  if (!dateStr) return null
  // Ja esta no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  // DD/MM/YYYY ou DD-MM-YYYY
  const parts = dateStr.split(/[\/-]/)
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function extractScholarity(text) {
  const lower = text.toLowerCase()
  const map = [
    { keywords: ['doutorado', 'phd', 'ph.d'], value: 'Doutorado' },
    { keywords: ['mestrado', 'mestre', 'msc', 'm.sc'], value: 'Mestrado' },
    { keywords: ['pos-graduacao', 'pos graduacao', 'especializa', 'lato sensu'], value: 'Pos-graduacao' },
    { keywords: ['superior completo', 'graduado', 'bacharel', 'licenciado', 'formado'], value: 'Superior Completo' },
    { keywords: ['superior incompleto', 'cursando', 'graduando', 'universitario'], value: 'Superior Incompleto' },
    { keywords: ['tecnico', 'tecnologo'], value: 'Ensino Tecnico' },
    { keywords: ['ensino medio', 'segundo grau', 'colegial'], value: 'Ensino Medio' },
    { keywords: ['ensino fundamental', 'primeiro grau'], value: 'Ensino Fundamental' },
  ]
  for (const { keywords, value } of map) {
    if (keywords.some((k) => lower.includes(k))) return value
  }
  return null
}

function extractLanguages(text) {
  const known = [
    'portugues', 'ingles', 'espanhol', 'frances', 'alemao', 'italiano',
    'japones', 'chines', 'mandarim', 'russo', 'arabic', 'coreano',
    'portuguese', 'english', 'spanish', 'french', 'german', 'italian',
    'japanese', 'chinese', 'russian', 'korean',
  ]
  const lower = text.toLowerCase()
  const found = known.filter((lang) => lower.includes(lang))
 
  const normalize = {
    portuguese: 'Português', english: 'Inglês', spanish: 'Espanhol',
    french: 'Francês', german: 'Alemão', italian: 'Italiano',
    japanese: 'Japonês', chinese: 'Chines', russian: 'Russo', korean: 'Coreano',
  }
  const normalized = found.map((l) => normalize[l] ?? capitalize(l))
  return [...new Set(normalized)].join(';')
}

function extractTechnologies(text) {
  const known = [
    'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift',
    'c#', 'c++', 'php', 'ruby', 'go', 'rust', 'scala', 'r',
    'react', 'angular', 'vue', 'next.js', 'nuxt', 'svelte',
    'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel',
    'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux',
    'git', 'github', 'gitlab', 'jenkins', 'ci/cd',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'graphql', 'rest', 'api', 'microservices',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit',
    'figma', 'photoshop', 'illustrator',
  ]
  const lower = text.toLowerCase()
  const found = known.filter((tech) => {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`).test(lower)
  })
  return [...new Set(found)].map(capitalize).join(';')
}

function extractKnowledge(text) {
  const known = [
    'liderança', 'comunicação', 'trabalho em equipe', 'proatividade',
    'criatividade', 'organização', 'responsabilidade', 'autonomia',
    'flexibilidade', 'adaptabilidade', 'resolucao de problemas',
    'pensamento crítico', 'inteligência emocional', 'empatia',
    'negociacao', 'persuasão', 'gestão de tempo', 'planejamento',
    'tomada de decisão', 'foco em resultados', 'orientação ao cliente',
    'multitarefa', 'atenção aos detalhes',
    // ingles
    'leadership', 'communication', 'teamwork', 'proactive',
    'creativity', 'organization', 'responsibility', 'autonomy',
    'flexibility', 'adaptability', 'problem solving',
    'critical thinking', 'emotional intelligence', 'empathy',
    'negotiation', 'time management', 'planning', 'decision making',
  ]
  const lower = text.toLowerCase()
  const found = known.filter((skill) => lower.includes(skill))
  const normalized = found.map((s) => capitalize(s))
  return [...new Set(normalized)].join(';')
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ─── Controller ──────────────────────────────────────────────────────────────

export const extractResumeData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.', error: true })
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
