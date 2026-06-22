export function AssociateFormSection({ children, title }) {
  return (
    <fieldset className="space-y-3">
      <legend className="w-full border-b border-slate-100 pb-1 text-sm font-bold text-slate-700">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
