import { createRequestHandler } from 'react-router'

declare global {
  interface CloudflareEnvironment extends Env {
    DUNE_ANALYTICS_API_KEY: string
    ASSETS: { fetch: typeof window.fetch }
  }
}

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment
      ctx: ExecutionContext
    }
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/assets')) {
      console.log('Serving asset using ASSETS binding', url.pathname)

      return env.ASSETS.fetch(request)
    }

    console.log('Serving non-asset', url.pathname)

    return requestHandler(request, {
      cloudflare: { env, ctx },
    })
  },
} satisfies ExportedHandler<CloudflareEnvironment>
