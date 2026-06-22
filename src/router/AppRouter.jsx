import { Suspense } from 'react'
import { BrowserRouter, Routes } from 'react-router-dom'
import { Loader } from '../components/atoms/Loader'
import { appRouteElements } from './appRouteElements'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>{appRouteElements}</Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function RouteLoader() {
  return <div className="flex items-center justify-center py-24"><Loader /></div>
}
