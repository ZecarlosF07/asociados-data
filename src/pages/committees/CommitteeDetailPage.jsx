import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/atoms/Badge'
import { EmptyState } from '../../components/atoms/EmptyState'
import { Loader } from '../../components/atoms/Loader'
import { useCommitteeDetail } from '../../hooks/useCommitteeDetail'
import { ROUTES } from '../../router/routes'
import { formatDate } from '../../utils/helpers'

export function CommitteeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { associates, committee, error, loading } = useCommitteeDetail(id)

  if (loading) return <div className="flex justify-center py-24"><Loader /></div>
  if (error || !committee) {
    return <EmptyState icon="!" title="Comité no encontrado" description={error || 'No existe el comité solicitado.'} />
  }

  return (
    <div className="max-w-5xl">
      <button className="mb-3 text-xs text-slate-400 hover:text-slate-600" onClick={() => navigate(ROUTES.COMITES)}>
        ← Volver a comités
      </button>
      <div className="mb-7 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{committee.name}</h1>
          <Badge variant={committee.is_active ? 'success' : 'default'}>
            {committee.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-slate-500">{committee.code || 'Sin código'}</p>
        {committee.description && <p className="mt-3 text-sm text-slate-600">{committee.description}</p>}
      </div>

      <h2 className="mb-4 text-base font-bold text-slate-900">Asociados vigentes ({associates.length})</h2>
      {associates.length === 0 ? (
        <EmptyState title="Sin asociados" description="Este comité no tiene asociados vigentes." />
      ) : (
        <div className="space-y-3">
          {associates.map(({ associate, id: assignmentId, joined_at: joinedAt }) => (
            <button
              key={assignmentId}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-slate-300"
              onClick={() => navigate(`${ROUTES.ASOCIADOS}/${associate.id}`)}
            >
              <span>
                <strong className="block text-sm text-slate-900">{associate.company_name}</strong>
                <span className="text-xs text-slate-400">{associate.internal_code} · RUC {associate.ruc || '—'}</span>
              </span>
              <span className="text-xs text-slate-400">Desde {formatDate(joinedAt) || '—'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
