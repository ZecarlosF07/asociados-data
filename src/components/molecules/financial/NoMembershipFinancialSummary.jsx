import { Badge } from '../../atoms/Badge'

export function NoMembershipFinancialSummary() {
  return (
    <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-700">Resumen financiero</h3>
        <Badge variant="default">No aplica · sin membresía</Badge>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        La empresa aún no tiene una membresía. La salud de pago se calculará cuando se registre un periodo.
      </p>
    </section>
  )
}
