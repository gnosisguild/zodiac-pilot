import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/edit-route', 'routes/edit-route.tsx'),
  route(
    '/:account/:chainId/available-safes',
    'routes/$account.$chainId.available-safes.ts',
  ),
] satisfies RouteConfig
