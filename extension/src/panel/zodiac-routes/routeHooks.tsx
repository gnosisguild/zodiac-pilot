import { useEffect, useRef } from 'react'
import { useSelectedRouteId } from './SelectedRouteContext'
import { useZodiacRoutes } from './ZodiacRouteContext'

export const useUpdateLastUsedRoute = () => {
  const [selectedRouteId] = useSelectedRouteId()
  const [routes, saveRoute] = useZodiacRoutes()

  const updateRef = useRef<(routeId: string) => void>()
  updateRef.current = (routeId: string) => {
    const route = routes.find((route) => route.id === routeId)
    if (route) {
      saveRoute({ ...route, lastUsed: Date.now() })
    }
  }

  useEffect(() => {
    console.debug('update last used timestamp for route', selectedRouteId)
    updateRef.current!(selectedRouteId)
  }, [selectedRouteId])
}
