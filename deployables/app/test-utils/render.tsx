import { createRenderFramework } from '@zodiac/test-utils'
import { default as routes } from '../app/routes'

export const render = await createRenderFramework(
  new URL('../app', import.meta.url),
  routes,
)
