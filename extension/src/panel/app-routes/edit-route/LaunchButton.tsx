import { PrimaryButton } from '@/components'
import { ZodiacRoute } from '@/types'
import {
  useSaveZodiacRoute,
  useSelectedRouteId,
  useZodiacRoute,
} from '@/zodiac-routes'
import { Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type LaunchButtonProps = {
  disabled: boolean

  initialRouteState: ZodiacRoute
  currentRouteState: ZodiacRoute

  onNeedConfirmationToClearTransactions: () => Promise<boolean>
}

export const LaunchButton = ({
  disabled,
  initialRouteState,
  currentRouteState,

  onNeedConfirmationToClearTransactions,
}: LaunchButtonProps) => {
  const [, setSelectedRouteId] = useSelectedRouteId()
  const currentZodiacRoute = useZodiacRoute()
  const saveRoute = useSaveZodiacRoute()

  const navigate = useNavigate()

  return (
    <PrimaryButton
      disabled={disabled}
      icon={Rocket}
      onClick={async () => {
        if (currentRouteState !== initialRouteState) {
          saveRoute(currentRouteState)
        }

        // we continue working with the same avatar, so don't have to clear the recorded transaction
        const keepTransactionBundle =
          currentZodiacRoute.avatar === currentRouteState.avatar

        const confirmed =
          keepTransactionBundle ||
          (await onNeedConfirmationToClearTransactions())

        if (!confirmed) {
          return
        }

        setSelectedRouteId(currentRouteState.id)
        navigate('/')
      }}
    >
      {currentRouteState !== initialRouteState ? 'Save & Launch' : 'Launch'}
    </PrimaryButton>
  )
}
