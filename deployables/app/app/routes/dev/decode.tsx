import { DebugJson } from '../DebugJson'
import type { Route } from './+types/decode'

const Decode = ({ params: { data } }: Route.ComponentProps) => {
  return <DebugJson data={data} />
}

export default Decode
