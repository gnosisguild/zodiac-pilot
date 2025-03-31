import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),

  layout('routes/layout.tsx', [
    route('/connect', 'routes/connect.tsx'),

    layout('routes/errorBoundary.tsx', [
      route('/callback', 'routes/auth/callback.ts'),

      ...prefix('/sign-up', [
        index('routes/auth/sign-up.tsx'),
        route('success', 'routes/auth/sign-up.success.tsx'),
      ]),

      route('/sign-in', 'routes/auth/sign-in.ts'),
      route('/profile', 'routes/auth/profile.tsx'),
      route('/logout', 'routes/auth/logout.ts'),

      route('/tokens', 'routes/tokens/index.tsx', [
        layout('routes/tokens/balances/layout.tsx', [
          route('balances', 'routes/tokens/balances/balances.tsx'),
        ]),
        layout('routes/tokens/send/layout.tsx', [
          route('send/:chain?/:token?', 'routes/tokens/send/send.tsx'),
        ]),
      ]),

      route('/new-route', 'routes/legacy-redirects/old-new-route-redirect.ts'),

      ...prefix('/edit', [
        index('routes/edit/list-routes.tsx'),
        route(':routeId', 'routes/edit/$routeId/load-route.ts'),
        route(':routeId/:data', 'routes/edit/$routeId.$data/edit-route.tsx'),

        route(':data', 'routes/legacy-redirects/extract-route-id-from-edit.ts'),
      ]),

      route(
        '/edit-route/:data',
        'routes/legacy-redirects/old-edit-redirect.ts',
      ),

      ...prefix('/create', [
        layout('routes/create/layout.tsx', [index('routes/create/create.tsx')]),
      ]),

      ...prefix('/submit', [
        layout('routes/submit/layout.tsx', [
          index('routes/submit/index.tsx'),
          route(
            ':route/:transactions',
            'routes/submit/$route.$transactions/sign.tsx',
          ),
        ]),
      ]),
    ]),
  ]),

  ...prefix('/:address/:chainId', [
    route('available-safes', 'routes/$address.$chainId/available-safes.ts'),
    route('initiators', 'routes/$address.$chainId/initiators.ts'),
    route('balances', 'routes/$address.$chainId/balances.ts'),
  ]),

  route('/db/health', 'routes/db/health.ts'),

  route('/dev/decode/:data', 'routes/dev/decode.tsx'),
] satisfies RouteConfig
