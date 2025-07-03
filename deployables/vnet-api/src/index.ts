import type { Env } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Handle RPC proxy requests
    if (pathname.startsWith('/rpc/')) {
      return handleRpcProxy(request)
    }

    // Handle CORS preflight for RPC proxy
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Handle existing vnet API requests
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
  },
}

async function handleRpcProxy(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Extract the Tenderly RPC URL from the path
  // Expected format: /rpc/{encoded-tenderly-url}
  const encodedUrl = pathname.slice(5) // Remove '/rpc/'
  if (!encodedUrl) {
    return Response.json({ error: 'RPC URL is required' }, { status: 400 })
  }

  try {
    const tenderlyUrl = decodeURIComponent(encodedUrl)

    // Validate that it's a Tenderly virtual network URL
    if (!tenderlyUrl.startsWith('https://virtual.mainnet.rpc.tenderly.co/')) {
      return Response.json(
        { error: 'Only Tenderly virtual network URLs are allowed' },
        { status: 400 },
      )
    }

    // Forward the request to Tenderly
    const proxyRequest = new Request(tenderlyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })

    const tenderlyResponse = await fetch(proxyRequest)

    // Create response with proper CORS headers
    const response = new Response(tenderlyResponse.body, {
      status: tenderlyResponse.status,
      statusText: tenderlyResponse.statusText,
      headers: tenderlyResponse.headers,
    })

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response
  } catch {
    return Response.json({ error: 'Failed to proxy request' }, { status: 500 })
  }
}
