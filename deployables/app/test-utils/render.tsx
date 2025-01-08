import {
  FrameworkRoute,
  renderFramework,
  RenderOptions,
  RouteModule,
} from '@zodiac/test-utils'

export function render<Module extends RouteModule>(
  currentPath: string,
  route: FrameworkRoute<Module>,
  options: RenderOptions,
) {
  return renderFramework(currentPath, route, options)
}
