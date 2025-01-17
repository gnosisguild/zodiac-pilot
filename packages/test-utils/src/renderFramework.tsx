import { type RouteConfig } from '@react-router/dev/routes'
import { render, type RenderResult } from '@testing-library/react'
import type { ComponentType } from 'react'
import type { ActionFunctionArgs } from 'react-router'
import { createRoutesStub, useLoaderData, useParams } from 'react-router'
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

export async function createRenderFramework<Config extends RouteConfig>(
  basePath: URL,
  routeConfig: Config,
) {
  const routes = await Promise.resolve(routeConfig)

  const stubRoutes = await Promise.all(
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
        path: route.path,
        clientLoader,
        loader,
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
                const loaderData = useLoaderData<typeof loader>()
                const params = useParams()

                // @ts-expect-error we're not yet suppliying all required props
                return <Component loaderData={loaderData} params={params} />
              },
      }
    }),
  )

  return async function renderFramework<
    Paths extends Awaited<RouteConfig>[number]['path'],
  >(
    currentPath: NonNullable<Paths>,
    { inspectRoutes = [], searchParams = {}, ...options }: RenderOptions = {},
  ): Promise<RenderResult> {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: TestElement,
        // @ts-expect-error the real types and the stub types aren't nicely aligned
        children: [
          ...stubRoutes,

          ...inspectRoutes.map((path) => ({ path, Component: InspectRoute })),
        ],
      },
    ])

    const result = render(
      <Stub initialEntries={[getCurrentPath(currentPath, searchParams)]} />,
      options,
    )

    await waitForTestElement()
    await sleepTillIdle()

    return result
  }
}
