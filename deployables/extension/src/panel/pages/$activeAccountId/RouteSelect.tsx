import type { ExecutionRoute } from '@zodiac/schema'
import { Select } from '@zodiac/ui'
import { Route } from 'lucide-react'

type RouteSelectProps = {
  routes: ExecutionRoute[]
  value: string | null
  onChange: (routeId: string) => void
}

export const RouteSelect = ({ routes, value, onChange }: RouteSelectProps) => {
  const selectedRoute = routes.find((route) => route.id === value)

  return (
    <div className="flex items-center gap-2">
      <Route size={16} />
      <Select
        inline
        className="flex-1"
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
    </div>
  )
}
