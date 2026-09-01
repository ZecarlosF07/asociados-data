import { CommitteeSelect } from '../CommitteeSelect'
import { FormField } from '../FormField'
import { UserProfileSelect } from '../UserProfileSelect'

export function ConversionAssociateFields({ errors, form, onChange }) {
  return (
    <>
      <FormField
        label="RUC"
        name="ruc"
        required
        value={form.ruc}
        onChange={onChange}
        error={errors.ruc}
        maxLength={11}
        helpText="Es obligatorio para completar la conversión."
      />
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        El asociado se creará <strong>En proceso</strong> y pasará a Activo cuando tenga una membresía vigente.
      </div>
      <FormField
        label="Fecha de asociación"
        name="associationDate"
        type="date"
        required
        value={form.associationDate}
        onChange={onChange}
        error={errors.associationDate}
      />
      <FormField label="Responsable de afiliación" name="responsibleUserId">
        <UserProfileSelect
          value={form.responsibleUserId}
          onChange={onChange}
          name="responsibleUserId"
          placeholder="Seleccionar responsable..."
        />
      </FormField>
      <FormField label="Comité principal" name="committeeId">
        <CommitteeSelect value={form.committeeId} onChange={onChange} name="committeeId" />
      </FormField>
      <FormField label="Observaciones" name="notes" value={form.notes} onChange={onChange} />
    </>
  )
}
