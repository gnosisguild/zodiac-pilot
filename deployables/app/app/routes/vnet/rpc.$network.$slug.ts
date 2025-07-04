import type { Route } from './+types/rpc.$network.$slug'

export async function action({ request, params }: Route.ActionArgs) {
  // Reconstruct the Tenderly URL with network parameter
  const tenderlyRpcUrl = `https://virtual.${params.network}.rpc.tenderly.co/${params.slug}`

  // Forward the request to Tenderly
  const tenderlyRequest = new Request(tenderlyRpcUrl, {
    method: request.method,
    headers: request.headers,
    body: await request.clone().arrayBuffer(), // need to clone the body to prevent error "duplex option is required when sending a body."
  })

  return await fetch(tenderlyRequest)
}
