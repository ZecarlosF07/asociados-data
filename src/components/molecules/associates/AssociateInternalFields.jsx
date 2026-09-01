import { CaptadorSelect } from '../CaptadorSelect'
import { CategorySelect } from '../CategorySelect'
import { FormField } from '../FormField'
import { UserProfileSelect } from '../UserProfileSelect'
import { AssociateFormSection } from './AssociateFormSection'

export function AssociateInternalFields({ form, onChange }) {
  return (
    <AssociateFormSection title="Información interna">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Libro / Padrón" name="book_registry" value={form.book_registry} onChange={onChange} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold text-slate-500">Estado del asociado</p>
          <p className="mt-1 text-sm text-slate-700">
            Se calcula automáticamente según la membresía.
          </p>
        </div>
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
