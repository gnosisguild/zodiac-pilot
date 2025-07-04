import { invariant } from '@epic-web/invariant'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { cors } from 'remix-utils/cors'

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

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return await cors(request, new Response(null, { status: 204 }), corsConfig)
  }

  // Return 405 Method Not Allowed for all other methods
  return await cors(
    request,
    new Response('Method Not Allowed', { status: 405 }),
    corsConfig,
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  // Handle OPTIONS requests in action as well
  if (request.method === 'OPTIONS') {
    return await cors(request, new Response(null, { status: 204 }), corsConfig)
  }

  // Validate network parameter
  const { network, slug } = params
  invariant(network, 'Network parameter is required')
  invariant(slug, 'Slug parameter is required')

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
    // need to clone the body to prevent error "duplex option is required when sending a body."
    body: await request.clone().arrayBuffer(),
  })

  const tenderlyResponse = await fetch(tenderlyRequest)

  // Clone the response to prevent TypeError: immutable
  const response = new Response(tenderlyResponse.body, {
    status: tenderlyResponse.status,
    statusText: tenderlyResponse.statusText,
    headers: tenderlyResponse.headers,
  })

  // Apply CORS headers
  return await cors(request, response, corsConfig)
}
