import { render } from '@testing-library/react'
import type { ComponentType } from 'react'
import { createRoutesStub, useLoaderData, useParams } from 'react-router'
import type {
  CreateActionData,
  CreateComponentProps,
  CreateLoaderData,
  CreateServerLoaderArgs,
} from 'react-router/route-module'
import { InspectRoute } from './InspectRoute'
import type { RenderOptions } from './render'
import { sleepTillIdle } from './sleepTillIdle'
import { TestElement, waitForTestElement } from './TestElement'

type Func = (...args: any[]) => unknown

type RouteModule = {
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
  parents: []
  id: 'routes/test-route'
  file: 'routes/test-route-not-real.tsx'
  path: '/test-route-not-real'
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

export async function renderFramework<Module extends RouteModule>(
  currentPath: string,
  route: FrameworkRoute<Module>,
  { inspectRoutes = [], ...options }: RenderOptions,
) {
  const Stub = createRoutesStub([
    {
      path: '/',
      Component: TestElement,
      children: [
        {
          path: route.path,
          Component() {
            const loaderData = useLoaderData<typeof route.loader>()
            const params = useParams()

            return (
              <route.Component
                // @ts-expect-error
                loaderData={loaderData}
                params={params}
              />
            )
          },
        },

        ...inspectRoutes.map((path) => ({ path, Component: InspectRoute })),
      ],
    },
  ])

  const result = render(<Stub initialEntries={[currentPath]} />, options)

  await waitForTestElement()
  await sleepTillIdle()

  return result
}
