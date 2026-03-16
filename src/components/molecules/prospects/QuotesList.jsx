import { Badge } from '../../atoms/Badge'
import { EmptyState } from '../../atoms/EmptyState'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { QUOTE_STATUS_VARIANT } from '../../../utils/prospectConstants'

export function QuotesList({ quotes }) {
  if (!quotes || quotes.length === 0) {
    return (
      <EmptyState
        icon="📄"
        title="Sin cotizaciones"
        description="Aún no se han registrado cotizaciones para este prospecto."
      />
    )
  }

  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const variant =
          QUOTE_STATUS_VARIANT[quote.quote_status?.code] || 'default'

        return (
          <div
            key={quote.id}
            className="border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-sm font-bold text-slate-900">
                  {quote.quote_number}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {formatDate(quote.issue_date)}
                </span>
              </div>
              <Badge variant={variant}>
                {quote.quote_status?.label || '—'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-500">
              <span>
                <span className="font-medium text-slate-700">Monto:</span>{' '}
                {formatCurrency(quote.quoted_amount)}
              </span>
              {quote.category && (
                <span>
                  <span className="font-medium text-slate-700">
                    Categoría:
                  </span>{' '}
                  {quote.category.name}
                </span>
              )}
              {quote.expiration_date && (
                <span>
                  <span className="font-medium text-slate-700">Vence:</span>{' '}
                  {formatDate(quote.expiration_date)}
                </span>
              )}
              {quote.sent_to_email && (
                <span className="col-span-full truncate">
                  <span className="font-medium text-slate-700">Enviado a:</span>{' '}
                  {quote.sent_to_email}
                </span>
              )}
            </div>

            {quote.notes && (
              <p className="text-xs text-slate-400 mt-2">{quote.notes}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
