export function DashboardPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bienvenido al Sistema de Asociados</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Prospectos</h3>
          <p className="dashboard-card-value">—</p>
          <span className="dashboard-card-label">Módulo pendiente</span>
        </div>

        <div className="dashboard-card">
          <h3>Asociados</h3>
          <p className="dashboard-card-value">—</p>
          <span className="dashboard-card-label">Módulo pendiente</span>
        </div>

        <div className="dashboard-card">
          <h3>Cobranza</h3>
          <p className="dashboard-card-value">—</p>
          <span className="dashboard-card-label">Módulo pendiente</span>
        </div>

        <div className="dashboard-card">
          <h3>Documentos</h3>
          <p className="dashboard-card-value">—</p>
          <span className="dashboard-card-label">Módulo pendiente</span>
        </div>
      </div>
    </div>
  )
}
