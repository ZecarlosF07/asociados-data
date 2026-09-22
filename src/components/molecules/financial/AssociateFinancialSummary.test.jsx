import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AssociateFinancialSummary } from './AssociateFinancialSummary'

describe('salud y deuda de empresa inactiva', () => {
  it('muestra salud no aplicable sin ocultar el saldo cobrable', () => {
    const html = renderToStaticMarkup(<AssociateFinancialSummary associate={{
      associate_status: { code: 'INACTIVO' },
      payment_health: { code: 'NO_APLICA_INACTIVO', label: 'No aplica · inactivo' },
      collectible_amount: 500,
      overdue_amount: 300,
    }} />)
    expect(html).toContain('No aplica · inactivo')
    expect(html).toContain('Deuda histórica cobrable')
    expect(html).toContain('300')
  })
})
