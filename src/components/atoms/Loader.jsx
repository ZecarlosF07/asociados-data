export function Loader({ size = 'md', className = '' }) {
  return (
    <div className={`loader loader-${size} ${className}`}>
      <div className="loader-spinner" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Loader size="lg" />
    </div>
  )
}
