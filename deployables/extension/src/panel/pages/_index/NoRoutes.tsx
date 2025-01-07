import { Info, InlineForm, Page, PrimaryButton } from '@/components'
import {
  createRoute,
  getLastUsedRouteId,
  getRoutes,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { useBridgeError } from '@/inject-bridge'
import { Plus } from 'lucide-react'
import { redirect } from 'react-router'

export const loader = async () => {
  const lastUsedRouteId = await getLastUsedRouteId()

  if (lastUsedRouteId != null) {
    return redirect(`/${lastUsedRouteId}`)
  }

  const [route] = await getRoutes()

  if (route != null) {
    return redirect(`/${route.id}`)
  }
}

export const action = async () => {
  const route = await createRoute()

  await saveLastUsedRouteId(route.id)

  return redirect(`/routes/edit/${route.id}`)
}

export const NoRoutes = () => {
  useBridgeError('To use Zodiac Pilot with a dApp you need to create a route.')

  return (
    <Page>
      <Page.Content>
        <div className="relative top-1/4 flex flex-1 flex-col items-center gap-8">
          <h2 className="mt-1 text-2xl font-light">Welcome to Zodiac Pilot</h2>

          <Info>
            You haven't created any routes, yet. Click the button below to
            create your first route.
          </Info>
        </div>
      </Page.Content>

      <Page.Footer>
        <InlineForm className="flex flex-col">
          <PrimaryButton submit icon={Plus}>
            Add route
          </PrimaryButton>
        </InlineForm>
      </Page.Footer>
    </Page>
  )
}
