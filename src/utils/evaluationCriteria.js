/**
 * Criterios de evaluación del prospecto
 * Cada criterio tiene opciones con puntaje de 0 a 3
 */
export const EVALUATION_CRITERIA = [
  {
    key: 'export_import_score',
    label: 'Exporta / importa',
    options: [
      { value: 3, label: 'Sí (internacionalmente)' },
      { value: 0, label: 'No' },
    ],
  },
  {
    key: 'social_participation_score',
    label: 'Partícipe en temas sociales',
    options: [
      { value: 3, label: 'Sí (inversión activa)' },
      { value: 2, label: 'Necesariamente (cumplimiento legal)' },
      { value: 0, label: 'No' },
    ],
  },
  {
    key: 'innovation_score',
    label: 'Empresa innovadora',
    options: [
      { value: 3, label: 'Sí (alta inversión)' },
      { value: 2, label: 'Sí (regular)' },
      { value: 1, label: 'Necesariamente (básico)' },
      { value: 0, label: 'No' },
    ],
  },
  {
    key: 'prico_score',
    label: 'PRICO',
    options: [
      { value: 3, label: 'Sí' },
      { value: 0, label: 'No' },
    ],
  },
  {
    key: 'market_size_score',
    label: 'Tamaño de mercado',
    options: [
      { value: 3, label: 'Internacional' },
      { value: 2, label: 'Nacional' },
      { value: 1, label: 'Local' },
    ],
  },
  {
    key: 'growth_opportunity_score',
    label: 'Oportunidad de crecimiento',
    options: [
      { value: 3, label: 'Excelente / alta' },
      { value: 2, label: 'Regular / media' },
      { value: 1, label: 'Poca / baja' },
      { value: 0, label: 'Nula' },
    ],
  },
  {
    key: 'representative_company_score',
    label: 'Empresa representativa',
    options: [
      { value: 3, label: 'Sí (posicionada / líder)' },
      { value: 2, label: 'Medianamente' },
      { value: 1, label: 'Conocida' },
      { value: 0, label: 'No' },
    ],
  },
  {
    key: 'qualified_staff_score',
    label: 'Personal calificado',
    options: [
      { value: 3, label: 'Sí (altamente calificado)' },
      { value: 2, label: 'Sí (estándar)' },
      { value: 1, label: 'No necesariamente (empírico)' },
      { value: 0, label: 'No' },
    ],
  },
  {
    key: 'competitive_advantage_score',
    label: 'Ventaja competitiva',
    options: [
      { value: 3, label: 'Sí (diferenciada)' },
      { value: 2, label: 'Sí (estándar)' },
      { value: 1, label: 'Necesariamente (básica)' },
      { value: 0, label: 'No' },
    ],
  },
]

/** Calcula el promedio de todos los criterios */
export function calculateAverageScore(scores) {
  const total = EVALUATION_CRITERIA.reduce(
    (sum, c) => sum + (Number(scores[c.key]) || 0),
    0
  )
  return Number((total / EVALUATION_CRITERIA.length).toFixed(2))
}

/** Construye un objeto de puntajes vacío */
export function getEmptyScores() {
  return EVALUATION_CRITERIA.reduce((acc, c) => {
    acc[c.key] = 0
    return acc
  }, {})
}
