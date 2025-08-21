import { RouteConfig } from '@react-router/dev/routes'
import { ActionFunction, matchPath, Register } from 'react-router'
import { StubRoute, stubRoutes } from './renderFramework'

export async function createPost<
  R extends Register,
  Config extends RouteConfig,
>(basePath: URL, routeConfig: Config) {
  const routes = await Promise.resolve(routeConfig)
  const stubbedRoutes = await stubRoutes<R>(basePath, routes)

  const pathToAction = mapPathsToActions(stubbedRoutes)

  return async function post(path: string, body: FormData, context: unknown) {
    for (const [pattern, action] of Object.entries(pathToAction)) {
      const match = matchPath(pattern, path)

      if (match == null) {
        continue
      }

      const request = new Request(new URL(match.pathname, 'http://localhost'), {
        method: 'POST',
        body,
      })

      await action({ request, params: match.params, context })
    }
  }
}

const mapPathsToActions = (
  routes: StubRoute[],
  currentPath?: string,
): Record<string, ActionFunction> => {
  if (routes.length === 0) {
    return {}
  }

  return routes.reduce<Record<string, ActionFunction>>((result, route) => {
    if (route.action == null) {
      if (route.children == null) {
        return result
      }

      if (route.path == null) {
        return { ...result, ...mapPathsToActions(route.children, currentPath) }
      }

      const path =
        currentPath == null ? route.path : [currentPath, route.path].join('/')

      return { ...result, ...mapPathsToActions(route.children, path) }
    }

    if (route.index) {
      return {
        ...result,
        [currentPath == null ? '/' : currentPath]: route.action,
      }
    }

    if (route.path == null) {
      if (route.children == null) {
        return result
      }

      return { ...result, ...mapPathsToActions(route.children, currentPath) }
    }

    const path =
      currentPath == null ? route.path : [currentPath, route.path].join('/')

    if (route.children == null) {
      return { ...result, [path]: route.action }
    }

    return {
      ...result,
      [path]: route.action,
      ...mapPathsToActions(route.children, path),
    }
  }, {})
}
