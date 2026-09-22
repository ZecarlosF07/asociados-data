import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InactiveDebtItem } from './InactiveDebtItem'

describe('deuda separada de la salud de pago', () => {
  it('mantiene visible la deuda vencida de una empresa inactiva', () => {
    const html = renderToStaticMarkup(<InactiveDebtItem collectibleAmount={350} overdueAmount={250} />)
    expect(html).toContain('Saldo cobrable')
    expect(html).toContain('Vencido:')
    expect(html).toContain('350')
    expect(html).toContain('250')
  })

  it('indica cuando no queda deuda cobrable', () => {
    const html = renderToStaticMarkup(<InactiveDebtItem collectibleAmount={0} overdueAmount={0} />)
    expect(html).toContain('Sin deuda')
  })
})
