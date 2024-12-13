import { Breadcrumbs, Page, PrimaryButton } from '@/components'
import { createRoute, getRoutes } from '@/execution-routes'
import { Plus } from 'lucide-react'
import { Form, redirect, useLoaderData, useNavigate } from 'react-router'
import { Route } from './Route'

export const loader = async () => {
  return {
    routes: await getRoutes(),
  }
}

export const action = async () => {
  const route = await createRoute()

  return redirect(`/routes/edit/${route.id}`)
}

export const ListRoutes = () => {
  const navigate = useNavigate()
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
          <Route
            key={route.id}
            route={route}
            onLaunch={(routeId) => navigate(`/${routeId}`)}
          />
        ))}
      </Page.Content>

      <Page.Footer>
        <Form className="flex flex-col" method="post">
          <PrimaryButton fluid submit icon={Plus}>
            Add route
          </PrimaryButton>
        </Form>
      </Page.Footer>
    </Page>
  )
}
