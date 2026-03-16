import { useState, useEffect } from 'react'
import { Button } from '../../atoms/Button'
import { Textarea } from '../../atoms/Textarea'
import { FormField } from '../FormField'
import {
  EVALUATION_CRITERIA,
  calculateAverageScore,
  getEmptyScores,
} from '../../../utils/evaluationCriteria'
import { formatCurrency } from '../../../utils/helpers'

export function EvaluationForm({ onSubmit, loading, categories }) {
  const [scores, setScores] = useState(getEmptyScores())
  const [observations, setObservations] = useState('')
  const [averageScore, setAverageScore] = useState(0)
  const [suggestion, setSuggestion] = useState(null)

  useEffect(() => {
    const avg = calculateAverageScore(scores)
    setAverageScore(avg)

    const suggested = categories?.find(
      (c) => avg >= Number(c.min_score) && avg <= Number(c.max_score)
    )
    setSuggestion(suggested || null)
  }, [scores, categories])

  const handleScoreChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...scores,
      average_score: averageScore,
      suggested_category_id: suggestion?.id || null,
      suggested_fee: suggestion?.base_fee || null,
      observations,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {EVALUATION_CRITERIA.map((criterion) => (
        <div key={criterion.key} className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-800">
            {criterion.label}
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            value={scores[criterion.key]}
            onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
          >
            {criterion.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.value} pts)
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700">Puntaje promedio:</span>
          <span className="font-bold text-slate-900">{averageScore}</span>
        </div>
        {suggestion && (
          <>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Categoría sugerida:</span>
              <span className="font-bold text-blue-600">{suggestion.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Tarifa sugerida:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(suggestion.base_fee)}
              </span>
            </div>
          </>
        )}
        {!suggestion && averageScore > 0 && (
          <p className="text-xs text-amber-600">
            No se encontró categoría para este puntaje.
          </p>
        )}
      </div>

      <FormField label="Observaciones" name="observations">
        <Textarea
          name="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Observaciones de la evaluación..."
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          Registrar evaluación
        </Button>
      </div>
    </form>
  )
}
