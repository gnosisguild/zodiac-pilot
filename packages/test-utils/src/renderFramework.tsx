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

export type RenderFrameworkOptions = Omit<RenderOptions, 'inspectRoutes'> & {
  loadActions?: () => Promise<unknown>
}

export type RenderFrameworkResult = RenderResult & {
  waitForPendingActions: () => Promise<void>
  waitForPendingLoaders: () => Promise<void>
}

const CombinedTestElement = () => (
  <TestElement>
    <InspectRoute />
  </TestElement>
)

type ResolveFn = () => void
type RejectFn = (error: unknown) => void

export async function createRenderFramework<
  R extends Register,
  Config extends RouteConfig,
>(basePath: URL, routeConfig: Config) {
  const routes = await Promise.resolve(routeConfig)

  const pendingLoaders: Promise<void>[] = []
  const pendingActions: Promise<void>[] = []

  const stubbedRoutes = await stubRoutes<R>(basePath, routes, {
    startLoader: () => {
      const { resolve, promise } = Promise.withResolvers<void>()

      pendingLoaders.push(promise)

      return resolve
    },
    startAction: () => {
      const { resolve, reject, promise } = Promise.withResolvers<void>()

      pendingActions.push(promise)

      return { resolve, reject }
    },
  })

  const waitForPendingLoaders = async () => {
    await Promise.all(pendingLoaders)
    await sleepTillIdle()
  }

  const waitForPendingActions = async () => {
    await Promise.all(pendingActions)

    await waitForPendingLoaders()
  }

  return async function renderFramework(
    currentPath: string,
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

    return { ...result, waitForPendingActions, waitForPendingLoaders }
  }
}

type StubRoute = Parameters<typeof createRoutesStub>[0]

type StubRoutesOptions = {
  startAction: () => { resolve: ResolveFn; reject: RejectFn }
  startLoader: () => ResolveFn
}

type AnyRouteFiles = Record<
  string,
  {
    id: string
    page: string
  }
>
function stubRoutes<R extends Register>(
  basePath: URL,
  routes: RouteConfigEntry[],
  { startAction, startLoader }: StubRoutesOptions,
): Promise<StubRoute> {
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
        async loader(loaderArgs: LoaderFunctionArgs) {
          const finishLoader = startLoader()

          try {
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
          } finally {
            finishLoader()
          }
        },
        // the test stub from react-router unfortunately
        // doesn't handle the clientAction/action hierarchy
        // so we built it ouselves.
        async action(actionArgs: ActionFunctionArgs) {
          const { resolve, reject } = startAction()

          let hasErrored = false

          try {
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
          } catch (error) {
            hasErrored = true

            reject(error)

            throw error
          } finally {
            if (!hasErrored) {
              resolve()
            }
          }
        },
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
            ? await stubRoutes(basePath, route.children, {
                startAction,
                startLoader,
              })
            : undefined,
      }
    }),
  )
}
