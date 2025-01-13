import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/edit-route', 'routes/edit-route.tsx'),
  route('/:avatar/available-safes', 'routes/$avatar.available-safes.ts'),
] satisfies RouteConfig
