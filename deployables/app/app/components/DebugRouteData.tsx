import { parseRouteData } from '@/utils'
import { useParams } from 'react-router'

export const DebugRouteData = () => {
  const { data } = useParams()

  if (data == null) {
    return null
  }

  return (
    <code className="overflow-y-auto text-sm">
      <pre>{JSON.stringify(parseRouteData(data), undefined, 2)}</pre>
    </code>
  )
}
