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

// CORS configuration – maximum permissiveness
// const corsConfig = {
//   origin: true,
//   methods: ['POST', 'OPTIONS', 'GET'], // GET for WebSocket upgrade
//   maxAge: 86400,
// }

function addCorsHeaders(request: Request, response: Response): Response {
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })

  // Add CORS headers
  // newResponse.headers.set('Access-Control-Allow-Origin', '*')
  // newResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
  // newResponse.headers.set('Access-Control-Allow-Credentials', 'true')

  // // Dynamically reflect ALL request headers in CORS response
  // newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  // newResponse.headers.set(
  //   'Access-Control-Max-Age',
  //   corsConfig.maxAge.toString(),
  // )

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
