import { useState } from 'react'
import { Button } from '../../atoms/Button'

export function ReportExportButton({ disabled = false, label = 'Exportar Excel', onExport }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onExport()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      loading={loading}
      disabled={disabled}
    >
      {label}
    </Button>
  )
}
