import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { NoMembershipFinancialSummary } from './NoMembershipFinancialSummary'

describe('salud de pago sin membresía', () => {
  it('muestra No aplica y no presenta importes como si existiera un periodo', () => {
    const html = renderToStaticMarkup(<NoMembershipFinancialSummary />)
    expect(html).toContain('No aplica · sin membresía')
    expect(html).toContain('aún no tiene una membresía')
    expect(html).not.toContain('Pendiente')
  })
})
