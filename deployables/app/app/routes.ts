import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),

  route('/robots.txt', 'routes/robots.ts'),

  route('/callback', 'routes/auth/callback.ts'),

  layout('routes/layout.tsx', [
    route('/connect', 'routes/connect.tsx'),

    layout('routes/errorBoundary.tsx', [
      ...prefix('/sign-up', [
        index('routes/auth/sign-up.tsx'),
        route('success', 'routes/auth/sign-up.success.tsx'),
      ]),

      route('/admin', 'routes/auth/admin.tsx'),

      layout('routes/tokens/index.tsx', [
        ...prefix('/tokens', [
          layout('routes/tokens/balances/layout.tsx', [
            route('balances', 'routes/tokens/balances/balances.tsx'),
          ]),
          layout('routes/tokens/send/layout.tsx', [
            route('send/:chain?/:token?', 'routes/tokens/send/send.tsx'),
          ]),
          layout('routes/tokens/swap/layout.tsx', [
            route('swap', 'routes/tokens/swap/swap.tsx'),
          ]),
        ]),
      ]),

      layout('routes/walletProvider.tsx', [
        route('/profile', 'routes/auth/profile.tsx', [
          route('add-wallet', 'routes/auth/add-wallet.tsx'),
          route('delete-wallet/:walletId', 'routes/auth/delete-wallet.tsx'),
        ]),

        route(
          '/new-route',
          'routes/legacy-redirects/old-new-route-redirect.ts',
        ),

        route('/account/:accountId', 'routes/account/edit.tsx'),

        ...prefix('/edit', [
          index('routes/edit/list-routes.tsx'),
          route(':routeId', 'routes/edit/$routeId/load-route.ts'),
          route(':routeId/:data', 'routes/edit/$routeId.$data/edit-route.tsx'),

          route(
            ':data',
            'routes/legacy-redirects/extract-route-id-from-edit.ts',
          ),
        ]),

        route(
          '/edit-route/:data',
          'routes/legacy-redirects/old-edit-redirect.ts',
        ),

        route('/create/:prefixedAddress?', 'routes/create/create.tsx'),

        ...prefix('/submit', [
          layout('routes/sign/layout.tsx', [
            index('routes/sign/index.tsx'),

            route(
              'account/:accountId/:transactions',
              'routes/sign/account.$accountId.$transactions/sign.tsx',
            ),

            route(
              ':route/:transactions',
              'routes/sign/$route.$transactions/sign.tsx',
            ),
          ]),
        ]),
      ]),
    ]),
  ]),

  layout('routes/system-admin/layout.tsx', [
    ...prefix('/system-admin', [
      index('routes/system-admin/_index.ts'),

      route('tenants', 'routes/system-admin/tenants/tenants.tsx'),
      route('tenant/:tenantId', 'routes/system-admin/tenants/tenant.tsx', [
        route('add-plan', 'routes/system-admin/tenants/add-plan.tsx'),
      ]),

      route('users', 'routes/system-admin/users/users.tsx', [
        route('remove/:workOsUserId', 'routes/system-admin/users/remove.tsx'),
      ]),

      route('/features', 'routes/system-admin/features/features.tsx', [
        route('create', 'routes/system-admin/features/create.tsx'),
        route('remove/:featureId', 'routes/system-admin/features/remove.tsx'),
      ]),

      route(
        'subscriptionPlans',
        'routes/system-admin/subscriptionPlans/subscriptionPlans.tsx',
        [route('create', 'routes/system-admin/subscriptionPlans/create.tsx')],
      ),
    ]),
  ]),

  ...prefix('/:address/:chainId', [
    route('available-safes', 'routes/$address.$chainId/available-safes.ts'),
    route('initiators', 'routes/$address.$chainId/initiators.ts'),
    route('balances', 'routes/$address.$chainId/balances.ts'),
  ]),

  route('/db/health', 'routes/db/health.ts'),

  ...prefix('/extension', [
    route('sign-in', 'routes/extension/sign-in.ts'),
    route('callback', 'routes/extension/callback.ts'),
    route('heartbeat', 'routes/extension/heartbeat.ts'),
    route('features', 'routes/extension/features.ts'),
    route('accounts', 'routes/extension/accounts.ts'),
    route('active-account', 'routes/extension/activeAccount.ts'),
    route('remove-active-account', 'routes/extension/removeActiveAccount.ts'),
    route('account/:accountId', 'routes/extension/account.ts'),
    route('active-route/:accountId', 'routes/extension/activeRoute.ts'),
  ]),

  ...prefix('/system', [route('get-plan', 'routes/system/get-plan.ts')]),

  ...prefix('/dev', [
    route('decode/:data', 'routes/dev/decode.tsx'),

    ...prefix('errors', [
      route('loader', 'routes/dev/errors/loader-error.ts'),
      route('action', 'routes/dev/errors/action-error.tsx'),
      route('component', 'routes/dev/errors/component-error.tsx'),
    ]),
  ]),
] satisfies RouteConfig
