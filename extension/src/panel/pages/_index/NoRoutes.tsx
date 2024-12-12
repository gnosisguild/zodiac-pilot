import { Info, Page, PrimaryButton } from '@/components'
import {
  getLastUsedRouteId,
  getRoutes,
  INITIAL_DEFAULT_ROUTE,
  saveRoute,
} from '@/execution-routes'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { Form, redirect } from 'react-router'

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
  const route = await saveRoute({ ...INITIAL_DEFAULT_ROUTE, id: nanoid() })

  return redirect(`/routes/edit/${route.id}`)
}

export const NoRoutes = () => {
  return (
    <Page>
      <Page.Header>
        <h2 className="mt-1 text-xl">Zodiac Pilot</h2>
      </Page.Header>

      <Page.Content>
        <Info>
          You haven't created any routes, yet. Click the button below to create
          your first route.
        </Info>
      </Page.Content>

      <Page.Footer>
        <Form method="post" className="flex flex-col">
          <PrimaryButton submit icon={Plus}>
            Add Route
          </PrimaryButton>
        </Form>
      </Page.Footer>
    </Page>
  )
}
