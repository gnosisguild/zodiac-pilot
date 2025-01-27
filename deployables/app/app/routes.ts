import {
  type RouteConfig,
  index,
  prefix,
  route,
} from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/connect', 'routes/connect.tsx'),
  route('/tokens', 'routes/tokens/index.tsx', [
    route('balances', 'routes/tokens/balances.tsx'),
    route('send', 'routes/tokens/send.tsx'),
  ]),
  route('/new-route', 'routes/new-route.ts'),
  route('/edit-route/:data', 'routes/edit-route.$data.tsx'),

  ...prefix('/:address/:chainId', [
    route('modules', 'routes/$address.$chainId/modules.ts'),
    route('available-safes', 'routes/$address.$chainId/available-safes.ts'),
    route('delegates', 'routes/$address.$chainId/delegates.ts'),
    route('balances', 'routes/$address.$chainId/balances.ts'),
  ]),
] satisfies RouteConfig
