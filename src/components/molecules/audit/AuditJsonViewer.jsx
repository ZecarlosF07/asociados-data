export function AuditJsonViewer({ title, value }) {
  return (
    <section className="min-w-0">
      <h4 className="text-xs font-bold text-slate-700 mb-2">{title}</h4>
      <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 text-slate-100 text-xs p-3 whitespace-pre-wrap break-words">
        {formatJson(value)}
      </pre>
    </section>
  )
}

function formatJson(value) {
  if (value == null) return 'null'

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
