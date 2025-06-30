import type { Route } from '@/companion'
import { Select } from '@zodiac/ui'

type RouteSelectProps = {
  routes: Route[]
  value?: string
}

export const RouteSelect = ({ routes, value }: RouteSelectProps) => {
  const selectedRoute = routes.find((route) => route.id === value)

  return (
    <Select
      label="Selected route"
      options={routes.map((route) => ({
        value: route.id,
        label: route.label,
      }))}
      value={
        selectedRoute == null
          ? undefined
          : { value: selectedRoute.id, label: selectedRoute.label }
      }
    />
  )
}
