import { Env } from './types'

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const { pathname } = new URL(request.url)
    const tenderlyForkApi = `https://api.tenderly.co/api/v1/account/${env.TENDERLY_USER}/project/${env.TENDERLY_PROJECT}/vnets`

    let path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
    // coerce the path, so that users won't be able to call some other Tenderly API endpoints
    path = path.replace(/[^a-z0-9\-/]/gi, '')

    const tenderlyRequest = new Request(`${tenderlyForkApi}${path}`, request)
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
