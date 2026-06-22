import { lazy } from 'react'

export function lazyPage(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })))
}
