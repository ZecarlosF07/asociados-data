import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { membershipsService } from '../../services/memberships.service'
import { Input } from '../../components/atoms/Input'
import { CatalogSelect } from '../../components/molecules/CatalogSelect'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { EmptyState } from '../../components/atoms/EmptyState'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { exportToExcel, EXPORT_COLUMNS } from '../../utils/exportUtils'
import {
  MEMBERSHIP_STATUS_VARIANT,
  FINANCIAL_CATALOG_GROUPS,
} from '../../utils/financialConstants'
import { ROUTES } from '../../router/routes'

export function MembershipsPage() {
  const navigate = useNavigate()
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    statusId: '',
    typeId: '',
  })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const data = await membershipsService.getAll(filters)
      setMemberships(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleFilterChange = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const handleClear = () => {
    setFilters({ search: '', statusId: '', typeId: '' })
  }

  const totalActivas = memberships.filter((m) => m.is_current).length

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Membresías</h1>
            <p className="text-sm text-slate-400">
              Vista global de todas las membresías registradas.
              {!loading && (
                <span className="ml-2 font-medium text-slate-600">
                  {memberships.length} total · {totalActivas} vigentes
                </span>
              )}
            </p>
          </div>
          {memberships.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => {
              exportToExcel({
                filename: `membresias_${formatDate(new Date()).replace(/\//g, '-')}`,
                sheetName: 'Membresías',
                data: memberships,
                columns: EXPORT_COLUMNS.memberships,
              })
            }}>
              📥 Exportar Excel
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 mb-6 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Buscar asociado
          </label>
          <Input
            placeholder="Razón social, RUC, código..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>

        <div className="w-44">
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Estado
          </label>
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_STATUS}
            value={filters.statusId}
            onChange={(e) => handleFilterChange({ statusId: e.target.value })}
            name="statusId"
            placeholder="Todos"
          />
        </div>

        <div className="w-44">
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Tipo
          </label>
          <CatalogSelect
            groupCode={FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_TYPE}
            value={filters.typeId}
            onChange={(e) => handleFilterChange({ typeId: e.target.value })}
            name="typeId"
            placeholder="Todos"
          />
        </div>

        <button
          type="button"
          className="text-xs text-slate-400 hover:text-slate-600 underline pb-1"
          onClick={handleClear}
        >
          Limpiar
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      ) : memberships.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin membresías"
          description="No se encontraron membresías con los filtros aplicados."
        />
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                  Asociado
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                  Categoría
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">
                  Tarifa
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                  Inicio
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                  Fin
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">
                  Estado
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">
                  Vigente
                </th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => {
                const statusCode = m.membership_status?.code
                const variant =
                  MEMBERSHIP_STATUS_VARIANT[statusCode] || 'default'

                return (
                  <tr
                    key={m.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(`${ROUTES.ASOCIADOS}/${m.associate_id}`)
                    }
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {m.associate?.company_name || '—'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {m.associate?.internal_code}
                        {m.associate?.ruc && ` · ${m.associate.ruc}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.membership_type?.label || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.category?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(m.fee_amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(m.start_date)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.end_date ? formatDate(m.end_date) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={variant}>
                        {m.membership_status?.label || '—'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {m.is_current ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
