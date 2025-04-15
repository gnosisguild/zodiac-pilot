import type { Env } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
