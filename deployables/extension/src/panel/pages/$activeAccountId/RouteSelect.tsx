import type { ExecutionRoute } from '@zodiac/schema'
import { Select } from '@zodiac/ui'

type RouteSelectProps = {
  routes: ExecutionRoute[]
  value: string | null
  onChange: (routeId: string) => void
}

export const RouteSelect = ({ routes, value, onChange }: RouteSelectProps) => {
  const selectedRoute = routes.find((route) => route.id === value)

  return (
    <Select
      label="Selected route"
      isClearable={false}
      options={routes.map((route) => ({
        value: route.id,
        label: route.label,
      }))}
      value={
        selectedRoute == null
          ? undefined
          : { value: selectedRoute.id, label: selectedRoute.label }
      }
      onChange={(route) => {
        if (route == null) {
          return
        }

        onChange(route.value)
      }}
    />
  )
}
