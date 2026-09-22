import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InactiveFinancialNotice } from './InactiveFinancialNotice'

describe('resumen financiero de inactivos', () => {
  it('explica que la deuda devengada sigue cobrable', () => {
    const html = renderToStaticMarkup(<InactiveFinancialNotice collectibleAmount={500} overdueAmount={300} />)
    expect(html).toContain('Deuda histórica cobrable')
    expect(html).toContain('está vencido')
  })
})
