import { GhostButton } from '@/components'
import { useRemoveZodiacRoute } from '@/zodiac-routes'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import { useRouteId } from './useRouteId'

export const RemoveButton = () => {
  const navigate = useNavigate()
  const removeRouteById = useRemoveZodiacRoute()
  const routeId = useRouteId()

  return (
    <GhostButton
      iconOnly
      style="critical"
      onClick={() => {
        removeRouteById(routeId)
        navigate('/routes')
      }}
    >
      <RiDeleteBinLine size={24} title="Remove this connection" />
    </GhostButton>
  )
}
