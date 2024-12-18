import { Breadcrumbs, InlineForm, Page, PrimaryButton } from '@/components'
import { createRoute, getLastUsedRouteId, getRoutes } from '@/execution-routes'
import { getString } from '@/utils'
import { Plus } from 'lucide-react'
import { redirect, useLoaderData, type ActionFunctionArgs } from 'react-router'
import { Route } from './Route'
import { Intent } from './intents'

export const loader = async () => {
  return {
    routes: await getRoutes(),
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
  }
}

export const ListRoutes = () => {
  const { routes } = useLoaderData<typeof loader>()

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
          <Route key={route.id} route={route} />
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
