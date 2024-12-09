import { PrimaryButton } from '@/components'
import {
  useExecutionRoute,
  useSaveExecutionRoute,
  useSelectedRouteId,
} from '@/execution-routes'
import type { ExecutionRoute } from '@/types'
import { Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type LaunchButtonProps = {
  disabled: boolean

  initialRouteState: ExecutionRoute
  currentRouteState: ExecutionRoute

  onNeedConfirmationToClearTransactions: () => Promise<boolean>
}

export const LaunchButton = ({
  disabled,
  initialRouteState,
  currentRouteState,

  onNeedConfirmationToClearTransactions,
}: LaunchButtonProps) => {
  const [, setSelectedRouteId] = useSelectedRouteId()
  const currentExecutionRoute = useExecutionRoute()
  const saveRoute = useSaveExecutionRoute()

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
          currentExecutionRoute.avatar === currentRouteState.avatar

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
