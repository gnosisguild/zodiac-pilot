import { getRoutes } from '@/execution-routes'
import { redirect } from 'react-router'

export const loader = async () => {
  const [route] = await getRoutes()

  if (route != null) {
    return redirect(`/${route.id}`)
  }
}

export const NoRoutes = () => {
  return <div>No routes</div>
}
