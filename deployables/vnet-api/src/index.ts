import type { Env } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest()
    }

    // Handle RPC proxy requests
    if (url.pathname.startsWith('/rpc/')) {
      return handleRpcProxy(request, url)
    }

    // Handle vnet management requests (existing functionality)
    return handleVnetManagement(request, env)
  },
}

function handleCorsPreflightRequest(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://pilot.gnosisguild.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  })
}

async function handleRpcProxy(request: Request, url: URL): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'only POST requests are supported for RPC' },
      { status: 405 },
    )
  }

  // Extract the Tenderly RPC path from the URL
  // Expected format: /rpc/virtual.mainnet.rpc.tenderly.co/rest-of-path
  const pathParts = url.pathname.split('/').slice(2) // Remove empty string and 'rpc'

  if (pathParts.length === 0) {
    return Response.json(
      { error: 'RPC endpoint path is required' },
      { status: 400 },
    )
  }

  // Reconstruct the Tenderly URL
  const tenderlyRpcUrl = `https://${pathParts.join('/')}`

  // Forward the request to Tenderly
  const tenderlyRequest = new Request(tenderlyRpcUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })

  try {
    const tenderlyResponse = await fetch(tenderlyRequest)

    // Create a new response with CORS headers
    const response = new Response(tenderlyResponse.body, {
      status: tenderlyResponse.status,
      statusText: tenderlyResponse.statusText,
      headers: tenderlyResponse.headers,
    })

    // Set CORS headers
    response.headers.set(
      'Access-Control-Allow-Origin',
      'https://pilot.gnosisguild.org',
    )
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    )

    return response
  } catch (error) {
    console.error('Error proxying RPC request:', error)
    return Response.json(
      { error: 'Failed to proxy RPC request' },
      { status: 500 },
    )
  }
}

async function handleVnetManagement(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'only POST requests are supported' },
      { status: 405 },
    )
  }

  const tenderlyVnetApi = `https://api.tenderly.co/api/v1/account/${env.TENDERLY_USER}/project/${env.TENDERLY_PROJECT}/vnets`
  const tenderlyRequest = new Request(`${tenderlyVnetApi}`, request)
  tenderlyRequest.headers.set('X-Access-Key', env.TENDERLY_ACCESS_KEY)
  const tenderlyResponse = await fetch(tenderlyRequest)

  // Recreate the response so you can modify the headers
  const response = new Response(tenderlyResponse.body, tenderlyResponse)

  // Set CORS headers
  response.headers.set(
    'Access-Control-Allow-Origin',
    'https://pilot.gnosisguild.org',
  )

  return response
}
