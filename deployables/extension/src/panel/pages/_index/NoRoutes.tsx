import { useCompanionAppUrl } from '@/companion'
import { getLastUsedRouteId, getRoutes } from '@/execution-routes'
import { useBridgeError } from '@/inject-bridge'
import { Info, Page, PrimaryLinkButton } from '@zodiac/ui'
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

const NoRoutes = () => {
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
        <PrimaryLinkButton
          openInNewWindow
          icon={Plus}
          to={`${useCompanionAppUrl()}/create`}
        >
          Add route
        </PrimaryLinkButton>
      </Page.Footer>
    </Page>
  )
}

export default NoRoutes
