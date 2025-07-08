export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Handle RPC proxy route: /rpc/{network}/{slug}
    if (pathParts[0] === 'rpc' && pathParts.length === 3) {
      const [, network, slug] = pathParts

      // Handle preflight OPTIONS requests
      if (request.method === 'OPTIONS') {
        return addCorsHeaders(request, new Response(null, { status: 204 }))
      }

      // Validate network and slug parameters
      if (!network || !slug) {
        return addCorsHeaders(
          request,
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

      // Handle GET requests without upgrade header
      if (request.method === 'GET') {
        return addCorsHeaders(
          request,
          new Response(
            'GET requests must include Upgrade: websocket header for WebSocket connections',
            {
              status: 400,
            },
          ),
        )
      }

      // Return 405 Method Not Allowed for non-POST requests
      if (request.method !== 'POST') {
        return addCorsHeaders(
          request,
          new Response('Method Not Allowed', { status: 405 }),
        )
      }

      // Reconstruct the Tenderly URL with validated network parameter
      const tenderlyRpcUrl = `https://virtual.${network}.rpc.tenderly.co/${slug}`

      // Forward the request to Tenderly with minimal required headers for JSON-RPC
      const tenderlyRequest = new Request(tenderlyRpcUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: await request.clone().arrayBuffer(),
      })

      try {
        const tenderlyResponse = await fetch(tenderlyRequest)

        // Clone the response and add CORS headers
        return addCorsHeaders(
          request,
          new Response(tenderlyResponse.body, {
            status: tenderlyResponse.status,
            statusText: tenderlyResponse.statusText,
            headers: tenderlyResponse.headers,
          }),
        )
      } catch (error) {
        console.error('Error proxying to Tenderly:', error)
        return addCorsHeaders(
          request,
          new Response('Internal Server Error', { status: 500 }),
        )
      }
    }

    // Handle other routes or return 404
    return new Response('Not Found', { status: 404 })
  },
}

function addCorsHeaders(request: Request, response: Response): Response {
  // Create a new response with only critical headers preserved
  const criticalHeaders = new Headers()

  // Preserve only critical headers from the original response
  const criticalHeaderNames = ['content-type', 'content-length']

  for (const [name, value] of response.headers.entries()) {
    if (criticalHeaderNames.includes(name.toLowerCase())) {
      criticalHeaders.set(name, value)
    }
  }

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: criticalHeaders,
  })

  // Add CORS headers
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  // Dynamically reflect all requested headers in CORS response (no canonicalization)
  const requestHeaders = request.headers.get('Access-Control-Request-Headers')
  if (requestHeaders) {
    newResponse.headers.set('Access-Control-Allow-Headers', requestHeaders)
  }
  newResponse.headers.set(
    'Vary',
    'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  )

  return newResponse
}

async function handleWebsocketRequest(
  request: Request,
  network: string,
  slug: string,
): Promise<Response> {
  const tenderlyWsUrl = `wss://virtual.${network}.rpc.tenderly.co/${slug}`

  try {
    // Create WebSocket pair for client and server
    const [clientSocket, _serverSocket] = Object.values(new WebSocketPair())

    // Connect to Tenderly WebSocket
    const tenderlySocket = new WebSocket(tenderlyWsUrl)

    // Forward messages from client to Tenderly
    clientSocket.addEventListener('message', (event) => {
      if (tenderlySocket.readyState === WebSocket.OPEN) {
        tenderlySocket.send(event.data)
      }
    })

    // Forward messages from Tenderly to client
    tenderlySocket.addEventListener('message', (event) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data)
      }
    })

    // Handle WebSocket close events
    clientSocket.addEventListener('close', () => {
      if (tenderlySocket.readyState === WebSocket.OPEN) {
        tenderlySocket.close()
      }
    })

    tenderlySocket.addEventListener('close', () => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close()
      }
    })

    // Handle WebSocket error events
    clientSocket.addEventListener('error', (error) => {
      console.error('Client WebSocket error:', error)
      if (tenderlySocket.readyState === WebSocket.OPEN) {
        tenderlySocket.close()
      }
    })

    tenderlySocket.addEventListener('error', (error) => {
      console.error('Tenderly WebSocket error:', error)
      if (clientSocket.readyState === WebSocket.OPEN) {
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
