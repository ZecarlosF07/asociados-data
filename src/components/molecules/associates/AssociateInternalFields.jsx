import { CaptadorSelect } from '../CaptadorSelect'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { FormField } from '../FormField'
import { UserProfileSelect } from '../UserProfileSelect'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import { AssociateFormSection } from './AssociateFormSection'

export function AssociateInternalFields({ errors, form, onChange }) {
  return (
    <AssociateFormSection title="Información interna">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Libro / Padrón" name="book_registry" value={form.book_registry} onChange={onChange} />
        <FormField label="Estado" name="associate_status_id" required error={errors.associate_status_id}>
          <CatalogSelect
            groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
            value={form.associate_status_id}
            onChange={onChange}
            name="associate_status_id"
          />
        </FormField>
        <FormField label="Categoría" name="category_id">
          <CategorySelect value={form.category_id} onChange={onChange} name="category_id" />
        </FormField>
        <FormField label="Responsable afiliación" name="affiliation_responsible_user_id">
          <UserProfileSelect
            value={form.affiliation_responsible_user_id}
            onChange={onChange}
            name="affiliation_responsible_user_id"
          />
        </FormField>
        <FormField label="Captador" name="captador_id">
          <CaptadorSelect value={form.captador_id} onChange={onChange} name="captador_id" placeholder="Seleccionar captador..." />
        </FormField>
        <label className="flex items-center gap-2 pt-5 text-xs font-semibold text-slate-800">
          <input
            type="checkbox"
            name="welcome_status"
            checked={form.welcome_status}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300"
          />
          Bienvenida confirmada
        </label>
      </div>
    </AssociateFormSection>
  )
}
