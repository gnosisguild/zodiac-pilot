import {
  type RouteConfig,
  type RouteConfigEntry,
} from '@react-router/dev/routes'
import { render, type RenderResult } from '@testing-library/react'
import type { ComponentType } from 'react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import {
  createRoutesStub,
  Outlet,
  useActionData,
  useLoaderData,
  useMatches,
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

export async function createRenderFramework<Config extends RouteConfig>(
  basePath: URL,
  routeConfig: Config,
) {
  const routes = await Promise.resolve(routeConfig)

  const pendingLoaders: Promise<void>[] = []
  const pendingActions: Promise<void>[] = []

  const stubbedRoutes = await stubRoutes(basePath, routes, {
    startLoader: () => {
      const { resolve, promise } = Promise.withResolvers<void>()

      pendingLoaders.push(promise)

      return resolve
    },
    startAction: () => {
      const { resolve, promise } = Promise.withResolvers<void>()

      pendingActions.push(promise)

      return resolve
    },
  })

  const waitForPendingLoaders = async () => {
    await Promise.all(pendingLoaders)
    await sleepTillIdle()
  }

  const waitForPendingActions = async () => {
    await Promise.all(pendingActions)
  }

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
  startAction: () => ResolveFn
  startLoader: () => ResolveFn
}

function stubRoutes(
  basePath: URL,
  routes: RouteConfigEntry[],
  { startAction, startLoader }: StubRoutesOptions,
): Promise<StubRoute> {
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
          const finishAction = startAction()

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
          } finally {
            finishAction()
          }
        },
        Component:
          Component == null
            ? undefined
            : () => (
                <Component
                  loaderData={useLoaderData()}
                  actionData={useActionData()}
                  params={useParams()}
                  // @ts-expect-error in this scenario we can't be 100% type-safe
                  // but that should be fine for a test-util
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
