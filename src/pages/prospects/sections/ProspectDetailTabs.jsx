import { useState } from 'react'
import { ProspectInfoSection } from '../../../components/molecules/prospects/ProspectInfoSection'
import { EvaluationSummary } from '../../../components/molecules/prospects/EvaluationSummary'
import { EvaluationForm } from '../../../components/molecules/prospects/EvaluationForm'
import { QuotesList } from '../../../components/molecules/prospects/QuotesList'
import { QuoteForm } from '../../../components/molecules/prospects/QuoteForm'
import { StatusTimeline } from '../../../components/molecules/prospects/StatusTimeline'
import { Button } from '../../../components/atoms/Button'

const TABS = [
  { key: 'info', label: 'Información' },
  { key: 'evaluation', label: 'Evaluación' },
  { key: 'quotes', label: 'Cotizaciones' },
  { key: 'history', label: 'Historial' },
]

export function ProspectDetailTabs({
  prospect,
  evaluations,
  quotes,
  statusHistory,
  categories,
  canEdit,
  actionLoading,
  onEvaluationSubmit,
  onQuoteSubmit,
}) {
  const [activeTab, setActiveTab] = useState('info')
  const [showEvalForm, setShowEvalForm] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)

  const currentEvaluation = evaluations.find((e) => e.is_current)

  return (
    <div>
      <div className="flex border-b border-slate-200 mb-5 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        {activeTab === 'info' && <ProspectInfoSection prospect={prospect} />}

        {activeTab === 'evaluation' && (
          <div className="space-y-4">
            {currentEvaluation && !showEvalForm && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-700">
                    Evaluación vigente
                  </h3>
                  {canEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowEvalForm(true)}
                    >
                      Nueva evaluación
                    </Button>
                  )}
                </div>
                <EvaluationSummary evaluation={currentEvaluation} />
              </>
            )}

            {(!currentEvaluation || showEvalForm) && canEdit && (
              <>
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  {currentEvaluation ? 'Nueva evaluación' : 'Registrar evaluación'}
                </h3>
                <EvaluationForm
                  categories={categories}
                  onSubmit={(data) => {
                    onEvaluationSubmit(data)
                    setShowEvalForm(false)
                  }}
                  loading={actionLoading}
                />
              </>
            )}

            {!currentEvaluation && !canEdit && (
              <p className="text-sm text-slate-400 py-6 text-center">
                No hay evaluación registrada.
              </p>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700">
                Cotizaciones ({quotes.length})
              </h3>
              {canEdit && !showQuoteForm && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowQuoteForm(true)}
                >
                  Nueva cotización
                </Button>
              )}
            </div>

            {showQuoteForm && canEdit && (
              <div className="border border-slate-200 rounded-lg p-4 mb-4">
                <QuoteForm
                  prospect={prospect}
                  onSubmit={(data) => {
                    onQuoteSubmit(data)
                    setShowQuoteForm(false)
                  }}
                  onCancel={() => setShowQuoteForm(false)}
                  loading={actionLoading}
                />
              </div>
            )}

            <QuotesList quotes={quotes} />
          </div>
        )}

        {activeTab === 'history' && (
          <StatusTimeline history={statusHistory} />
        )}
      </div>
    </div>
  )
}
