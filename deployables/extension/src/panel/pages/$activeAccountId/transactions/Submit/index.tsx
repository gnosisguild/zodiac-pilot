import { useExecutionRoute } from '@/execution-routes'
import { CompleteRoute } from './CompleteRoute'
import { Sign } from './Sign'
import { SubmitCallback } from './SubmitCallback'

export const Submit = () => {
  const route = useExecutionRoute()

  const url = new URL(window.location.href)
  const callback = url.searchParams.get('callback')

  if (callback) {
    return <SubmitCallback />
  }

  if (route != null && route.initiator != null) {
    return <Sign />
  }

  return <CompleteRoute />
}
