import { getRoutes } from '@/execution-routes'
import { redirect } from 'react-router-dom'

export const loader = async () => {
  const [route] = await getRoutes()

  console.log({ route })

  if (route != null) {
    return redirect(`/${route.id}`)
  }
}

export const NoRoutes = () => {
  return <div>No routes</div>
}
