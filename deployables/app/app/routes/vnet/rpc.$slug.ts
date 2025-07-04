import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { cors } from 'remix-utils/cors'

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle preflight OPTIONS requests
  return await cors(request, new Response(null, { status: 200 }), {
    origin: true,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}

export async function action({ request, params }: ActionFunctionArgs) {
  // Reconstruct the Tenderly URL
  const tenderlyRpcUrl = `https://virtual.mainnet.rpc.tenderly.co/${params.slug}`

  // Forward the request to Tenderly
  const tenderlyRequest = new Request(tenderlyRpcUrl, {
    method: request.method,
    headers: request.headers,
    body: await request.clone().arrayBuffer(), // need to clone the body to prevent error "duplex option is required when sending a body."
  })

  const tenderlyResponse = await fetch(tenderlyRequest)

  // Create a new response with the Tenderly response data
  const response = new Response(tenderlyResponse.body, {
    status: tenderlyResponse.status,
    statusText: tenderlyResponse.statusText,
    headers: tenderlyResponse.headers,
  })

  // Apply CORS headers using remix-utils
  return await cors(request, response, {
    origin: true,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
}
