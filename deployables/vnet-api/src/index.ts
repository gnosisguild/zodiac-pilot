export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Handle RPC proxy route: /rpc/{network}/{slug}
    if (pathParts[0] === 'rpc' && pathParts.length === 3) {
      const [, network, slug] = pathParts

      // Handle preflight OPTIONS requests
      if (request.method === 'OPTIONS') {
        return addCorsHeaders(new Response(null, { status: 204 }))
      }

      // Validate network and slug parameters
      if (!network || !slug) {
        return addCorsHeaders(
          new Response('Network and slug parameters are required', {
            status: 400,
          }),
        )
      }

      // Check if this is a WebSocket upgrade request
      const upgradeHeader = request.headers.get('upgrade')
      if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
        return handleWebsocketRequest(request, network, slug)
      }

      // Return 405 Method Not Allowed for non-POST requests (non-WebSocket)
      if (request.method !== 'POST') {
        return addCorsHeaders(
          new Response('Method Not Allowed', { status: 405 }),
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

async function handleWebsocketRequest(
  request: Request,
  network: string,
  slug: string,
): Promise<Response> {
  const tenderlyWsUrl = `wss://virtual.${network}.rpc.tenderly.co/${slug}`

  // Filter out sensitive headers for WebSocket
  const filteredHeaders = new Headers()
  for (const [key, value] of request.headers.entries()) {
    if (!SENSITIVE_HEADERS.has(key.toLowerCase())) {
      filteredHeaders.set(key, value)
    }
  }

  try {
    // Create WebSocket pair for client and server
    const [clientSocket, _serverSocket] = Object.values(new WebSocketPair())

    // Connect to Tenderly WebSocket
    const tenderlySocket = new WebSocket(tenderlyWsUrl)

    // Forward messages from client to Tenderly
    clientSocket.addEventListener('message', (event) => {
      if (tenderlySocket.readyState === WebSocket.READY_STATE_OPEN) {
        tenderlySocket.send(event.data)
      }
    })

    // Forward messages from Tenderly to client
    tenderlySocket.addEventListener('message', (event) => {
      if (clientSocket.readyState === WebSocket.READY_STATE_OPEN) {
        clientSocket.send(event.data)
      }
    })

    // Handle WebSocket close events
    clientSocket.addEventListener('close', () => {
      if (tenderlySocket.readyState === WebSocket.READY_STATE_OPEN) {
        tenderlySocket.close()
      }
    })

    tenderlySocket.addEventListener('close', () => {
      if (clientSocket.readyState === WebSocket.READY_STATE_OPEN) {
        clientSocket.close()
      }
    })

    // Handle WebSocket error events
    clientSocket.addEventListener('error', (error) => {
      console.error('Client WebSocket error:', error)
      if (tenderlySocket.readyState === WebSocket.READY_STATE_OPEN) {
        tenderlySocket.close()
      }
    })

    tenderlySocket.addEventListener('error', (error) => {
      console.error('Tenderly WebSocket error:', error)
      if (clientSocket.readyState === WebSocket.READY_STATE_OPEN) {
        clientSocket.close()
      }
    })

    // Accept the WebSocket connection
    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
    })
  } catch (error) {
    console.error('Error establishing WebSocket connection:', error)
    return new Response('WebSocket connection failed', { status: 500 })
  }
}
