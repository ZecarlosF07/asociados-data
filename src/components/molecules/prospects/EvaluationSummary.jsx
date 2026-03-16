import { Badge } from '../../atoms/Badge'
import { formatCurrency } from '../../../utils/helpers'
import { EVALUATION_CRITERIA } from '../../../utils/evaluationCriteria'

export function EvaluationSummary({ evaluation }) {
  if (!evaluation) return null

  const scoreItems = EVALUATION_CRITERIA.map((c) => ({
    label: c.label,
    value: evaluation[c.key],
  }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scoreItems.map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center text-sm px-3 py-1.5 bg-slate-50 rounded"
          >
            <span className="text-slate-600">{item.label}</span>
            <ScoreDot value={item.value} />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-wrap gap-4">
        <div className="text-sm">
          <span className="text-slate-500">Promedio: </span>
          <span className="font-bold text-slate-900">
            {evaluation.average_score}
          </span>
        </div>
        {evaluation.suggested_category && (
          <div className="text-sm">
            <span className="text-slate-500">Categoría: </span>
            <Badge variant="info">{evaluation.suggested_category.name}</Badge>
          </div>
        )}
        {evaluation.suggested_fee != null && (
          <div className="text-sm">
            <span className="text-slate-500">Tarifa: </span>
            <span className="font-bold">
              {formatCurrency(evaluation.suggested_fee)}
            </span>
          </div>
        )}
      </div>

      {evaluation.observations && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded p-3">
          {evaluation.observations}
        </p>
      )}
    </div>
  )
}

function ScoreDot({ value }) {
  const colors = {
    0: 'bg-slate-300',
    1: 'bg-amber-400',
    2: 'bg-blue-400',
    3: 'bg-green-500',
  }
  const color = colors[value] || 'bg-slate-300'

  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="font-semibold text-slate-800">{value}</span>
    </span>
  )
}
