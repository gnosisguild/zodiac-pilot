import {
  renderFramework,
  type FrameworkRoute,
  type RenderOptions,
  type RouteModule,
} from '@zodiac/test-utils'

export function render<Module extends RouteModule>(
  currentPath: string,
  route: FrameworkRoute<Module>,
  options: RenderOptions,
) {
  return renderFramework(currentPath, route, options)
}
