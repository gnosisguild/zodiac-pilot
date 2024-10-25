import { IconButton } from '@/components'
import { useRemoveZodiacRoute } from '@/zodiac-routes'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import { useRouteId } from './useRouteId'

export const RemoveButton = () => {
  const navigate = useNavigate()
  const removeRouteById = useRemoveZodiacRoute()
  const routeId = useRouteId()

  return (
    <IconButton
      danger
      onClick={() => {
        removeRouteById(routeId)
        navigate('/routes')
      }}
      className="hover:bg-zodiac-light-red aspect-square border-[3px] border-double border-red-800 p-1 hover:bg-opacity-20"
    >
      <RiDeleteBinLine size={24} title="Remove this connection" />
    </IconButton>
  )
}
