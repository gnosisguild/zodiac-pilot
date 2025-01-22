import {
  type RouteConfig,
  index,
  prefix,
  route,
} from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/connect', 'routes/connect.tsx'),
  route('/new-route', 'routes/new-route.ts'),
  route('/edit-route/:data', 'routes/edit-route.$data.tsx'),
  ...prefix('/:account/:chainId', [
    route('available-safes', 'routes/$account.$chainId/available-safes.ts'),
    route('delegates', 'routes/$account.$chainId/delegates.ts'),
  ]),
  route('/:avatar/:chainId/modules', 'routes/$avatar.$chainId/modules.ts'),
] satisfies RouteConfig
