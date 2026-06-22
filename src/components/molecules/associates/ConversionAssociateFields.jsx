import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { CatalogSelect } from '../CatalogSelect'
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
      <FormField label="Estado inicial del asociado" name="statusId" required error={errors.statusId}>
        <CatalogSelect
          groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
          value={form.statusId}
          onChange={onChange}
          name="statusId"
          placeholder="Seleccionar estado..."
        />
      </FormField>
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
