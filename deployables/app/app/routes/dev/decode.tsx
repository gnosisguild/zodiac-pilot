import { Error as ErrorAlert } from '@zodiac/ui'
import { DebugJson } from '../DebugJson'
import type { Route } from './+types/decode'

const Decode = ({ params: { data } }: Route.ComponentProps) => {
  return <DebugJson data={data} />
}

export default Decode

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (error instanceof Error) {
    return <ErrorAlert title={error.message}>{error.stack}</ErrorAlert>
  }

  return null
}
