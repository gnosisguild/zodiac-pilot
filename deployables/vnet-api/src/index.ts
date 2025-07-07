import type { Env } from './types'

// Headers that should be filtered out to prevent sensitive data leakage
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'x-api-key',
  'x-access-key',
  'x-auth-token',
  'x-tenderly-access-key',
  'x-tenderly-project',
  'x-tenderly-user',
  'user-agent', // Prevent user agent fingerprinting
  'referer', // Prevent referer leakage
  'origin', // Prevent origin leakage
])

// CORS configuration – maximum permissiveness
const corsConfig = {
  origin: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
    'Cache-Control',
    'Connection',
    'Cookie',
    'DNT',
    'Host',
    'If-Modified-Since',
    'If-None-Match',
    'Origin',
    'Pragma',
    'Referer',
    'Sec-Fetch-Dest',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'User-Agent',
    'X-Forwarded-For',
    'X-Forwarded-Proto',
    'X-Real-IP',
    'X-Requested-With',
  ],
  maxAge: 86400,
}

function addCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })

  // Add CORS headers
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  newResponse.headers.set(
    'Access-Control-Allow-Headers',
    corsConfig.allowedHeaders.join(', '),
  )
  newResponse.headers.set(
    'Access-Control-Max-Age',
    corsConfig.maxAge.toString(),
  )

  return newResponse
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Handle RPC proxy route: /rpc/{network}/{slug}
    if (pathParts[0] === 'rpc' && pathParts.length === 3) {
      const [, network, slug] = pathParts

      // Handle preflight OPTIONS requests
      if (request.method === 'OPTIONS') {
        return addCorsHeaders(new Response(null, { status: 204 }))
      }

      // Return 405 Method Not Allowed for non-POST requests
      if (request.method !== 'POST') {
        return addCorsHeaders(
          new Response('Method Not Allowed', { status: 405 }),
        )
      }

      // Validate network and slug parameters
      if (!network || !slug) {
        return addCorsHeaders(
          new Response('Network and slug parameters are required', {
            status: 400,
          }),
        )
      }

      // Reconstruct the Tenderly URL with validated network parameter
      const tenderlyRpcUrl = `https://virtual.${network}.rpc.tenderly.co/${slug}`

      // Filter out sensitive headers
      const filteredHeaders = new Headers()
      for (const [key, value] of request.headers.entries()) {
        if (!SENSITIVE_HEADERS.has(key.toLowerCase())) {
          filteredHeaders.set(key, value)
        }
      }

      // Forward the request to Tenderly with filtered headers
      const tenderlyRequest = new Request(tenderlyRpcUrl, {
        method: request.method,
        headers: filteredHeaders,
        body: await request.clone().arrayBuffer(),
      })

      try {
        const tenderlyResponse = await fetch(tenderlyRequest)

        // Clone the response and add CORS headers
        return addCorsHeaders(
          new Response(tenderlyResponse.body, {
            status: tenderlyResponse.status,
            statusText: tenderlyResponse.statusText,
            headers: tenderlyResponse.headers,
          }),
        )
      } catch (error) {
        console.error('Error proxying to Tenderly:', error)
        return addCorsHeaders(
          new Response('Internal Server Error', { status: 500 }),
        )
      }
    }

    // Handle other routes or return 404
    return new Response('Not Found', { status: 404 })
  },
}
