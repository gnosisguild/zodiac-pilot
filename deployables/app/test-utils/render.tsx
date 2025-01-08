import { renderFramework, RenderOptions, Route } from '@zodiac/test-utils'

export const render = (
  currentPath: string,
  routes: Route[],
  options: RenderOptions,
) => renderFramework(currentPath, routes, options)
