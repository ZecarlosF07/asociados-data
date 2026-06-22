import { CatalogSelect } from '../CatalogSelect'
import { CommitteeSelect } from '../CommitteeSelect'
import { FormField } from '../FormField'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { AssociateFormSection } from './AssociateFormSection'

export function AssociateCompanyFields({ errors, form, isEdit, onChange }) {
  return (
    <AssociateFormSection title="Datos de la empresa">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Razón social" name="company_name" required value={form.company_name} onChange={onChange} error={errors.company_name} />
        <FormField label="Nombre comercial" name="trade_name" value={form.trade_name} onChange={onChange} />
        {!isEdit && (
          <FormField label="Comité principal" name="committee_id">
            <CommitteeSelect value={form.committee_id} onChange={onChange} name="committee_id" />
          </FormField>
        )}
        <FormField label="RUC" name="ruc" required maxLength={11} value={form.ruc} onChange={onChange} error={errors.ruc} />
        <FormField label="Actividad económica" name="economic_activity" value={form.economic_activity} onChange={onChange} />
        <FormField label="Tipo de actividad" name="activity_type_id">
          <CatalogSelect
            groupCode={ASSOCIATE_CATALOG_GROUPS.ACTIVITY_TYPE}
            value={form.activity_type_id}
            onChange={onChange}
            name="activity_type_id"
          />
        </FormField>
        <FormField label="Tamaño de empresa" name="company_size_id">
          <CatalogSelect
            groupCode={ASSOCIATE_CATALOG_GROUPS.COMPANY_SIZE}
            value={form.company_size_id}
            onChange={onChange}
            name="company_size_id"
          />
        </FormField>
        <FormField label="Página web" name="website" value={form.website} onChange={onChange} />
      </div>
    </AssociateFormSection>
  )
}
