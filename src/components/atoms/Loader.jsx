const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
}

export function Loader({ size = 'md' }) {
  return (
    <span className="inline-flex items-center justify-center">
      <span
        className={`${SIZES[size]} border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin`}
      />
    </span>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader size="lg" />
    </div>
  )
}
