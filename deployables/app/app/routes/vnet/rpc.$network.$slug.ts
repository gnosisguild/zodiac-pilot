import { invariant } from '@epic-web/invariant'
import type { ActionFunctionArgs } from 'react-router'

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

export async function action({ request, params }: ActionFunctionArgs) {
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
    body: await request.clone().arrayBuffer(), // need to clone the body to prevent error "duplex option is required when sending a body."
  })

  return await fetch(tenderlyRequest)
}
