import {
  type RouteConfig,
  type RouteConfigEntry,
} from '@react-router/dev/routes'
import { render, type RenderResult } from '@testing-library/react'
import type { ComponentType } from 'react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import {
  createRoutesStub,
  useActionData,
  useLoaderData,
  useParams,
} from 'react-router'
import type {
  CreateActionData,
  CreateComponentProps,
  CreateLoaderData,
  CreateServerLoaderArgs,
} from 'react-router/route-module'
import { getCurrentPath } from './getCurrentPath'
import { InspectRoute } from './InspectRoute'
import type { RenderOptions } from './render'
import { sleepTillIdle } from './sleepTillIdle'
import { TestElement, waitForTestElement } from './TestElement'

type Func = (...args: any[]) => unknown

export type RouteModule = {
  meta?: Func
  links?: Func
  headers?: Func
  loader?: Func
  clientLoader?: Func
  action?: Func
  clientAction?: Func
  HydrateFallback?: unknown
  default?: unknown
  ErrorBoundary?: unknown
  [key: string]: unknown
}

type Info<Module extends RouteModule> = {
  parents: [
    {
      parents: []
      id: 'root'
      file: 'root.tsx'
      path: ''
      params: {} & { [key: string]: string | undefined }
      module: Module
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      loaderData: CreateLoaderData<{}>
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      actionData: CreateActionData<{}>
    },
  ]
  id: any
  file: any
  path: any
  params: {} & { [key: string]: string | undefined }
  module: Module
  loaderData: CreateLoaderData<Module>
  actionData: CreateActionData<Module>
}

export type FrameworkRoute<
  Module extends RouteModule,
  Loader extends Func | undefined = Module['loader'],
> = {
  path: string
  Component: ComponentType<CreateComponentProps<Info<Module>>>
  loader?: Loader extends Func
    ? (args: CreateServerLoaderArgs<Info<Module>>) => ReturnType<Loader>
    : never
}

export type RenderFrameworkOptions = Omit<RenderOptions, 'inspectRoutes'> & {
  loadActions?: () => Promise<unknown>
}

export type RenderFrameworkResult = RenderResult

const CombinedTestElement = () => (
  <TestElement>
    <InspectRoute />
  </TestElement>
)

export async function createRenderFramework<Config extends RouteConfig>(
  basePath: URL,
  routeConfig: Config,
) {
  const routes = await Promise.resolve(routeConfig)

  const stubbedRoutes = await stubRoutes(basePath, routes)

  return async function renderFramework<
    Paths extends Awaited<RouteConfig>[number]['path'],
  >(
    currentPath: NonNullable<Paths>,
    { searchParams = {}, loadActions, ...options }: RenderFrameworkOptions = {},
  ): Promise<RenderFrameworkResult> {
    const { promise, resolve } = Promise.withResolvers<void>()

    const Stub = createRoutesStub([
      {
        Component: CombinedTestElement,
        async loader() {
          if (loadActions != null) {
            await loadActions()
          }

          resolve()

          return null
        },
        // @ts-expect-error the real types and the stub types aren't nicely aligned
        children: [...stubbedRoutes],
      },
    ])

    const result = render(
      <Stub initialEntries={[getCurrentPath(currentPath, searchParams)]} />,
      options,
    )

    await promise

    await waitForTestElement()
    await sleepTillIdle()

    return result
  }
}

type StubRoute = {
  path?: string
  clientLoader?: Func
  loader?: Func
  action?: Func
  Component?: ComponentType
}

function stubRoutes(
  basePath: URL,
  routes: RouteConfigEntry[],
): Promise<StubRoute[]> {
  return Promise.all(
    routes.map(async (route) => {
      const {
        clientLoader,
        loader,
        clientAction,
        action,
        default: RouteComponent,
      }: RouteModule = await import(
        new URL(route.file, `${basePath}/`).pathname
      )

      const Component = RouteComponent as ComponentType<
        CreateComponentProps<Info<RouteModule>>
      >

      return {
        id: route.id,
        index: route.index,
        path: route.path,
        // the test stub from react-router unfortunately
        // doesn't handle the clientLoader/loader hierarchy
        // so we built it ouselves.
        loader(loaderArgs: LoaderFunctionArgs) {
          if (clientLoader != null) {
            return clientLoader({
              ...loaderArgs,
              serverLoader:
                loader == null ? undefined : () => loader(loaderArgs),
            })
          }

          if (loader != null) {
            return loader(loaderArgs)
          }

          return null
        },
        // the test stub from react-router unfortunately
        // doesn't handle the clientAction/action hierarchy
        // so we built it ouselves.
        action(actionArgs: ActionFunctionArgs) {
          if (clientAction != null) {
            return clientAction({
              ...actionArgs,
              serverAction: action ? () => action(actionArgs) : undefined,
            })
          }

          if (action != null) {
            return action(actionArgs)
          }

          return null
        },
        Component:
          Component == null
            ? undefined
            : () => {
                const loaderData = useLoaderData()
                const actionData = useActionData()
                const params = useParams()

                return (
                  // @ts-expect-error we're not yet suppliying all required props
                  <Component
                    loaderData={loaderData}
                    actionData={actionData}
                    params={params}
                  />
                )
              },

        children:
          route.children != null
            ? await stubRoutes(basePath, route.children)
            : undefined,
      }
    }),
  )
}
