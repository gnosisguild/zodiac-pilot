import {
  type RouteConfig,
  type RouteConfigEntry,
} from '@react-router/dev/routes'
import { render, type RenderResult } from '@testing-library/react'
import type { ComponentType } from 'react'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Register,
} from 'react-router'
import {
  createRoutesStub,
  Outlet,
  useActionData,
  useLoaderData,
  useMatches,
  useParams,
} from 'react-router'
import type { GetAnnotations, GetInfo } from 'react-router/internal'
import { getCurrentPath } from './getCurrentPath'
import { InspectRoute } from './InspectRoute'
import type { RenderOptions } from './render'
import { TestElement, waitForTestElement } from './TestElement'
import { waitForPendingActions, WatchForActions } from './WatchForActions'

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

export type RenderFrameworkOptions = Omit<RenderOptions, 'inspectRoutes'> & {
  loadActions?: () => Promise<unknown>
  extraRoutes?: StubRoute[]
}

export type RenderFrameworkResult = RenderResult

const CombinedTestElement = () => (
  <TestElement>
    <InspectRoute />
    <WatchForActions />
  </TestElement>
)

export async function createRenderFramework<
  R extends Register,
  Config extends RouteConfig,
>(basePath: URL, routeConfig: Config) {
  const routes = await Promise.resolve(routeConfig)

  const stubbedRoutes = await stubRoutes<R>(basePath, routes)

  return async function renderFramework(
    currentPath: string,
    {
      searchParams = {},
      loadActions,
      extraRoutes = [],
      ...options
    }: RenderFrameworkOptions = {},
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
        children: [...stubbedRoutes, ...extraRoutes],
      },
    ])

    const result = render(
      <Stub initialEntries={[getCurrentPath(currentPath, searchParams)]} />,
      options,
    )

    await promise

    await waitForTestElement()
    await waitForPendingActions()

    return result
  }
}

export type StubRoute = Parameters<typeof createRoutesStub>[0][number]

type AnyRouteFiles = Record<
  string,
  {
    id: string
    page: string
  }
>
export function stubRoutes<R extends Register>(
  basePath: URL,
  routes: RouteConfigEntry[],
): Promise<StubRoute[]> {
  type RouteFiles = R extends {
    routeFiles: infer Registered extends AnyRouteFiles
  }
    ? Registered
    : AnyRouteFiles

  return Promise.all(
    routes.map(async (route) => {
      const {
        clientLoader,
        loader,
        clientAction,
        action,
        default: RouteComponent = Outlet,
      }: RouteModule = await import(
        new URL(route.file, `${basePath}/`).pathname
      )

      const _routeModule = {
        clientLoader,
        loader,
        clientAction,
        action,
        default: RouteComponent as Func,
      }

      type Annotations = GetAnnotations<
        // @ts-expect-error In this util we can't yet properly infer the
        // info for the actual route data
        GetInfo<{ file: keyof RouteFiles; module: typeof _routeModule }> & {
          module: typeof _routeModule
          matches: []
        }
      >

      const Component = RouteComponent as ComponentType<
        Annotations['ComponentProps']
      >

      return {
        id: route.id,
        index: route.index,
        path: route.path,
        // the test stub from react-router unfortunately
        // doesn't handle the clientLoader/loader hierarchy
        // so we built it ouselves.
        loader:
          clientLoader != null || loader != null
            ? async (loaderArgs: LoaderFunctionArgs) => {
                if (clientLoader != null) {
                  return await clientLoader({
                    ...loaderArgs,
                    serverLoader:
                      loader == null ? undefined : () => loader(loaderArgs),
                  })
                }

                if (loader != null) {
                  return await loader(loaderArgs)
                }

                return null
              }
            : undefined,
        // the test stub from react-router unfortunately
        // doesn't handle the clientAction/action hierarchy
        // so we built it ouselves.
        action:
          clientAction != null || action != null
            ? async (actionArgs: ActionFunctionArgs) => {
                if (clientAction != null) {
                  return await clientAction({
                    ...actionArgs,
                    serverAction: action ? () => action(actionArgs) : undefined,
                  })
                }

                if (action != null) {
                  return await action(actionArgs)
                }

                return null
              }
            : undefined,
        Component:
          Component == null
            ? undefined
            : () => (
                <Component
                  loaderData={useLoaderData<
                    Annotations['ComponentProps']['loaderData']
                  >()}
                  actionData={useActionData<
                    Annotations['ComponentProps']['actionData']
                  >()}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  params={useParams()}
                  matches={useMatches()}
                />
              ),
        children:
          route.children != null
            ? await stubRoutes(basePath, route.children)
            : undefined,
      }
    }),
  )
}
