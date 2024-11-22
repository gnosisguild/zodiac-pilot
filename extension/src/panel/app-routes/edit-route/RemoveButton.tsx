import { GhostButton } from '@/components'
import { useRemoveZodiacRoute } from '@/zodiac-routes'
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRouteId } from './useRouteId'

export const RemoveButton = () => {
  const navigate = useNavigate()
  const removeRouteById = useRemoveZodiacRoute()
  const routeId = useRouteId()

  return (
    <GhostButton
      iconOnly
      icon={Trash2}
      style="critical"
      onClick={() => {
        removeRouteById(routeId)
        navigate('/routes')
      }}
    >
      Remove this connection
    </GhostButton>
  )
}
