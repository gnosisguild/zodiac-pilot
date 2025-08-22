import { useOptionalExecutionRoute } from '@/execution-routes'
import { CompleteRoute } from './CompleteRoute'
import { Sign } from './Sign'
import { SubmitCallback, useSubmitCallback } from './SubmitCallback'

export const Submit = () => {
  const route = useOptionalExecutionRoute()
  const callback = useSubmitCallback()

  if (callback) {
    return <SubmitCallback />
  }

  if (route != null && route.initiator != null) {
    return <Sign route={route} />
  }

  return <CompleteRoute />
}
