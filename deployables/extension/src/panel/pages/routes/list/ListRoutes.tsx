import {
  createRoute,
  getLastUsedRouteId,
  getRoute,
  getRoutes,
  removeRoute,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { getString } from '@/utils'
import { Breadcrumbs, InlineForm, Page, PrimaryButton } from '@zodiac/ui'
import { Plus } from 'lucide-react'
import { redirect, useLoaderData, type ActionFunctionArgs } from 'react-router'
import { Route } from './Route'
import { Intent } from './intents'

export const loader = async () => {
  const routes = await getRoutes()
  const activeRouteId = await getLastUsedRouteId()

  if (activeRouteId != null) {
    const { avatar } = await getRoute(activeRouteId)

    return {
      routes,
      currentlyActiveAvatar: avatar,
    }
  }

  return {
    routes,
    currentlyActiveAvatar: null,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()

  switch (getString(data, 'intent')) {
    case Intent.addRoute: {
      const route = await createRoute()

      return redirect(`/routes/edit/${route.id}`)
    }

    case Intent.launchRoute: {
      const routeId = getString(data, 'routeId')

      return redirect(`/${routeId}`)
    }

    case Intent.clearTransactions: {
      const currentlyActiveRouteId = await getLastUsedRouteId()

      const newActiveRouteId = getString(data, 'newActiveRouteId')

      return redirect(
        `/${currentlyActiveRouteId}/clear-transactions/${newActiveRouteId}`,
      )
    }

    case Intent.removeRoute: {
      const lastUsedRouteId = await getLastUsedRouteId()
      const routeId = getString(data, 'routeId')

      await removeRoute(routeId)

      if (lastUsedRouteId === routeId) {
        await saveLastUsedRouteId(null)
      }

      const routes = await getRoutes()

      if (routes.length === 0) {
        return redirect('/')
      }

      const [newActiveRoute] = routes

      await saveLastUsedRouteId(newActiveRoute.id)

      return null
    }
  }
}

export const ListRoutes = () => {
  const { routes, currentlyActiveAvatar } = useLoaderData<typeof loader>()

  return (
    <Page>
      <Page.Header>
        <Breadcrumbs>
          <Breadcrumbs.Entry to="/">Transactions</Breadcrumbs.Entry>
        </Breadcrumbs>

        <h2 className="mt-1 text-xl">Pilot Routes</h2>
      </Page.Header>

      <Page.Content>
        {routes.map((route) => (
          <Route
            key={route.id}
            route={route}
            currentlyActiveAvatar={currentlyActiveAvatar}
          />
        ))}
      </Page.Content>

      <Page.Footer>
        <InlineForm className="flex flex-col">
          <PrimaryButton submit icon={Plus} intent={Intent.addRoute}>
            Add route
          </PrimaryButton>
        </InlineForm>
      </Page.Footer>
    </Page>
  )
}
