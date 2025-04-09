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

    console.log(url.pathname)
    if (url.pathname.startsWith('/assets')) {
      console.log('LOAD ASSET')
      return env.ASSETS.fetch(request)
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    })
  },
} satisfies ExportedHandler<CloudflareEnvironment>
