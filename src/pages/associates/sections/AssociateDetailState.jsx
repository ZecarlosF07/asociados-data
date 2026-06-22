import { Loader } from '../../../components/atoms/Loader'

export function AssociateDetailState({ error, loading, onBack }) {
  if (loading) return <div className="flex items-center justify-center py-24"><Loader /></div>
  return (
    <div className="max-w-3xl py-24 text-center">
      <p className="mb-4 text-slate-400">{error || 'Asociado no encontrado'}</p>
      <button className="text-sm text-blue-500 underline" onClick={onBack}>Volver al listado</button>
    </div>
  )
}
