import { useState } from 'react'
import { Button } from '../../components/atoms/Button'
import { EmptyState } from '../../components/atoms/EmptyState'
import { Loader } from '../../components/atoms/Loader'
import { AuditFilters } from '../../components/molecules/audit/AuditFilters'
import { AuditLogDetailModal } from '../../components/molecules/audit/AuditLogDetailModal'
import { AuditLogListItem } from '../../components/molecules/audit/AuditLogListItem'
import { useAuditLogs } from '../../hooks/useAuditLogs'

export function AuditPage() {
  const [selectedLog, setSelectedLog] = useState(null)
  const {
    logs,
    loading,
    loadingMore,
    error,
    filters,
    hasMore,
    updateFilters,
    clearFilters,
    loadMore,
  } = useAuditLogs()

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Auditoría</h1>
        <p className="text-sm text-slate-400">
          Consulta de acciones, cambios y trazabilidad operativa del sistema.
        </p>
      </div>

      <AuditFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClear={clearFilters}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      ) : error ? (
        <EmptyState
          icon="!"
          title="No se pudo cargar la auditoría"
          description={error}
        />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin eventos"
          description="No se encontraron eventos de auditoría con los filtros aplicados."
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <AuditLogListItem
              key={log.id}
              log={log}
              onClick={setSelectedLog}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                loading={loadingMore}
                onClick={loadMore}
              >
                Cargar más
              </Button>
            </div>
          )}
        </div>
      )}

      <AuditLogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  )
}
