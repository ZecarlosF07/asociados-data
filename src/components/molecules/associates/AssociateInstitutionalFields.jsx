import { FormField } from '../FormField'
import { AssociateFormSection } from './AssociateFormSection'

export function AssociateInstitutionalFields({ errors, form, onChange }) {
  return (
    <AssociateFormSection title="Datos institucionales">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Dirección" name="address" value={form.address} onChange={onChange} />
        <FormField label="Correo corporativo" name="corporate_email" type="email" value={form.corporate_email} onChange={onChange} error={errors.corporate_email} />
        <FormField label="Teléfono fijo" name="landline_phone" value={form.landline_phone} onChange={onChange} />
        <FormField label="Celular 1" name="mobile_phone_1" value={form.mobile_phone_1} onChange={onChange} />
        <FormField label="Celular 2" name="mobile_phone_2" value={form.mobile_phone_2} onChange={onChange} />
        <FormField label="Fecha de asociación" name="association_date" type="date" required value={form.association_date} onChange={onChange} error={errors.association_date} />
        <FormField label="Fecha de aniversario" name="anniversary_date" type="date" value={form.anniversary_date} onChange={onChange} />
      </div>
    </AssociateFormSection>
  )
}
